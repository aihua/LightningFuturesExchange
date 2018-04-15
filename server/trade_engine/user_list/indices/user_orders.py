from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_dictionary_array_version import DictionaryDictionaryArrayVersion
from models.models.order import Order
from models.models.contract import Contract
from helpers.helper import insert_sorted

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

    @staticmethod
    def get_place_order_amount_helper(equity, contract, orders):
        temp_quantity = 0 if contract is None else contract.quantity
        long_amount = 0.0
        short_amount = 0.0

        for user_order in orders:
            temp_order_quantity = user_order.quantity

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

        new_order_quantity = order.quantity
        new_contract = Contract(
            quantity=order.quantity,
            is_long=order.is_long
        )
        if contract is not None:
            if contract.is_long != order.is_long:
                new_order_quantity = max(0, order.quantity - contract.quantity)
                new_contract.quantity = abs(order.quantity - contract.quantity)

                contract_closing_quantity = min(contract.quantity, order.quantity)
                contract_diff_multiplier = (-1.0 if contract.is_long else 1.0)
                contract_price_difference = (order.get_price() - contract.get_price()) * contract_diff_multiplier

                amount["delta_balance"] += contract_closing_quantity * contract_price_difference

                if order.quantity > contract.quantity:
                    new_contract.is_long = not new_contract.is_long
            else:
                new_contract.quantity += order.quantity

        order_price = (order.get_price() / equity.decimal_points_price)
        margin_requirement = (equity.margin_requirement / equity.PERCENT_MULTIPLIER)
        tradable_requirement = (equity.tradable_requirement / equity.PERCENT_MULTIPLIER)

        amount["margin"] += new_order_quantity * order_price * margin_requirement
        amount["margin_orders"] += new_order_quantity * order_price * tradable_requirement

        temp_orders = []
        for i in range(0, orders.get_length()):
            temp_orders.append(orders.get_index(i))

        amount_with_old_contract = self.get_equity_order_cost(equity, contract, temp_orders)
        amount_with_new_contract = self.get_equity_order_cost(equity, new_contract, temp_orders)

        amount["margin_orders"] += amount_with_new_contract - amount_with_old_contract
