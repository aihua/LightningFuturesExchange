from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_dictionary_array_version import DictionaryDictionaryArrayVersion
from models.models.order import Order
from models.models.contract import Contract
from helpers.helper import insert_sorted, quick_sort
import math

class UserOrders(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.orders = DictionaryDictionaryArrayVersion(
            {},
            Order.effective_price_comparer_dec,
            "user_id",
            "equity_id",
            is_in_list=Order.is_opened,
            model_name="orders",
            events=self.trade_engine.events
        )

    def subscribe_to_events(self, events):
        events.subscribe("get_place_order_amount", self.get_place_order_amount)
        events.subscribe("get_execute_order_amount", self.get_execute_order_amount)
        events.subscribe("user_update_equity_price", self.user_update_equity_price)
        events.subscribe("user_order_margin_call", self.user_order_margin_call)

    @staticmethod
    def get_place_order_amount_helper(equity, contract, orders):
        temp_quantity = 0 if contract is None else contract.get_quantity(equity)
        long_amount = 0.0
        short_amount = 0.0

        for user_order in orders:
            temp_order_quantity = user_order.get_quantity(equity)

            if temp_quantity >= 0 and contract.is_long != user_order.is_long:
                diff = temp_quantity - temp_order_quantity
                temp_quantity = max(0, diff)
                temp_order_quantity = max(0, -diff)

            add_amount = temp_order_quantity * (user_order.get_price() / equity.decimal_points_price)

            if user_order.is_long:
                long_amount += add_amount
            else:
                short_amount += add_amount

        return max(long_amount, short_amount) * (equity.tradable_requirement / equity.PERCENT_MULTIPLIER)

    @staticmethod
    def get_gain(equity, contract):
        price_diff = equity.current_price - contract.get_price()
        return price_diff * math.pow(10, equity.decimal_points_price) * contract.get_quantity(equity)

    @staticmethod
    def get_equity_order_cost(equity, contract, orders):
        remaining_quantity = 0 if contract is None else contract.quantity
        contract_is_long = True if contract is None or contract.is_long else False

        orders_list = []
        for order in orders:
            orders_list.append(order)

        if not contract_is_long:
            quick_sort(orders_list, Order.effective_price_comparer)

        total_price = 0.0
        for order in orders_list:
            order_quantity = order.quantity

            if remaining_quantity > 0 and order.is_long != contract_is_long:
                order_quantity = max(0, order.quantity - remaining_quantity)
                remaining_quantity = max(0, remaining_quantity - order.quantity)

            actual_order_quantity = order_quantity * math.pow(10, equity.decimal_points_quantity)
            total_price = actual_order_quantity * equity.current_price

        mf = math.pow(10, equity.decimal_points_quantity + equity.decimal_points_price)

        return total_price * mf * equity.tradable_requirement / equity.PERCENT_MULTIPLIER

    def get_place_order_amount(self, order, amount):
        equity = self.trade_engine.equity_list.get_equity(order)
        contract = self.trade_engine.user_list.get_contract(order)
        orders = self.orders.get_list(order)

        temp_orders = []
        for order in orders:
            temp_orders.append(order)

        amount_without_order = self.get_equity_order_cost(equity, contract, temp_orders)
        insert_sorted(temp_orders, order, Order.effective_price_comparer_dec)
        amount_with_order = self.get_equity_order_cost(equity, contract, temp_orders)

        amount["margin_orders"] += amount_with_order - amount_without_order

    def get_execute_order_amount(self, order, amount):
        equity = self.trade_engine.equity_list.get_equity(order)
        contract = self.trade_engine.user_list.get_contract(order)
        orders = self.orders.get_list(order)

        new_order_quantity = order.get_quantity(equity)
        new_contract = Contract()
        new_contract.quantity = order.quantity
        new_contract.is_long = order.is_long

        if contract is not None:
            if contract.is_long != order.is_long:
                new_order_quantity = max(0, order.get_quantity(equity) - contract.get_quantity(equity))
                new_contract.quantity = abs(order.get_quantity(equity) - contract.get_quantity(equity))

                contract_closing_quantity = min(contract.quantity, order.quantity)
                contract_diff_multiplier = (-1.0 if contract.is_long else 1.0) * math.pow(10, equity.decimal_points_price)
                contract_price_difference = (order.get_price() - contract.get_price()) * contract_diff_multiplier

                delta_balance = contract_closing_quantity * contract_price_difference

                amount["delta_balance"] += delta_balance
                amount["margin"] -= delta_balance
                amount["margin-orders"] -= delta_balance

                if order.quantity > contract.quantity:
                    new_contract.is_long = not new_contract.is_long
            else:
                new_contract.quantity += order.quantity

        order_price = order.get_price() * math.pow(10, equity.decimal_points_price)
        margin_requirement = (equity.margin_requirement / equity.PERCENT_MULTIPLIER)
        tradable_requirement = (equity.tradable_requirement / equity.PERCENT_MULTIPLIER)

        amount["margin"] += new_order_quantity * order_price * margin_requirement
        amount["margin_orders"] += new_order_quantity * order_price * tradable_requirement

        amount_with_old_contract = self.get_equity_order_cost(equity, contract, orders)
        amount_with_new_contract = self.get_equity_order_cost(equity, new_contract, orders)

        amount["margin_orders"] += amount_with_new_contract - amount_with_old_contract

    def user_update_equity_price(self, user, new_equity, old_equity, amount):
        index_object = Contract()
        index_object.equity_id = new_equity.equity_id
        index_object.user_id = user.user_id

        contract = self.trade_engine.user_list.get_contract(index_object)

        if contract is not None:
            gain = self.get_gain(new_equity, contract) - self.get_gain(old_equity, contract)
            amount['margin_orders'] -= gain
            amount['margin'] -= gain

        orders = self.orders.get_list(index_object)

        amount_with_old_equity = self.get_equity_order_cost(old_equity, contract, orders)
        amount_with_new_equity = self.get_equity_order_cost(new_equity, contract, orders)

        amount["margin_orders"] += amount_with_new_equity - amount_with_old_equity

    def user_order_margin_call(self, user):
        user_orders = self.orders.dic[user.user_id]

        orders_to_cancel = []

        for key in user_orders.keys():
            order = Order()
            order.equity_id = key
            order.user_id = user.user_id

            order = self.orders.get_item(order)

            if order is None:
                continue

            orders_to_cancel.append(order)

        if len(orders_to_cancel) > 0:
            if user.user_id == self.trade_engine.order_book.executing_user_id:
                raise Exception("InsufficientFunds")

        for order_to_cancel in orders_to_cancel:
            self.trade_engine.events.trigger("cancel_order", order_to_cancel, True)
