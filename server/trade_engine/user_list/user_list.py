from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_version import DictionaryVersion
from transactional_data_structures.events import EventPriority

from indices.user_orders import UserOrders
from indices.user_contracts import UserContracts
from indices.user_transactions import UserTransactions


class UserList(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine
        self.users = DictionaryVersion({}, "user_id", model_name="users", events=trade_engine.events)

        self.user_orders = UserOrders(trade_engine)
        self.user_contracts = UserContracts(trade_engine)
        self.user_transactions = UserTransactions(trade_engine)

        self.subscribe_to_events(trade_engine.events)

    def subscribe_to_events(self, events):
        events.subscribe("place_order", self.user_can_place_order, EventPriority.VALIDATION)
        events.subscribe("match_order", self.check_user_can_execute_order, EventPriority.VALIDATION)
        events.subscribe("contracts_insert_item", self.create_contract)
        events.subscribe("contracts_update_item", self.update_contract)

    def check_user_can_place_order(self, order):
        user = self.users.get_item(order)

        order_amount = {"amount": 0}

        self.trade_engine.events.trigger("get_place_order_amount", order, order_amount)

        usd_margin_orders = user.margin_used_orders + order_amount["amount"]
        btc_price = self.trade_engine.get_bitcoin_price()

        if (usd_margin_orders / btc_price) >= user.balance:
            raise Exception("InsufficientFunds")

    def check_user_can_execute_order(self, order, matched_order):
        user = self.users.get_item(order)

        order_amount = {"amount": 0}

        self.trade_engine.events.trigger("get_execute_order_amount", order, order_amount)

        usd_margin = user.margin_used + order_amount["amount"]
        btc_price = self.trade_engine.get_bitcoin_price()

        if (usd_margin / btc_price) >= user.balance:
            raise Exception("InsufficientFunds")

    def update_user_balance(self, user, delta_balance):
        old_user = self.users.get_item(user)
        new_user = old_user.clone()

        btc_price = self.trade_engine.get_bitcoin_price()
        btc_decimal = self.trade_engine.BITCOIN_DECIMAL

        new_user.add_to_balance(-delta_balance * btc_decimal / btc_price)

        self.trade_engine.events.trigger("users_update_item", new_user, old_user)

    def create_contract_helper(self, contract, quantity, is_maker):
        amount = {"amount": 0}
        self.trade_engine.events.trigger("user_create_contract_fee", contract, quantity, is_maker, amount)
        self.update_user_balance(contract, -amount["amount"])

    def create_contract(self, contract, is_maker):
        self.create_contract_helper(contract, contract.quantity, is_maker)

    def update_contract(self, new_contract, old_contract, is_maker):
        quantity = new_contract.quantity - old_contract.quantity

        if quantity > 0:
            self.create_contract_helper(new_contract, quantity, is_maker)
        else:
            amount = {"amount": 0}
            self.trade_engine.events.trigger("user_create_contract_fee", new_contract, -quantity, is_maker, amount)
            self.trade_engine.events.trigger("user_update_contract_fee", new_contract, old_contract, is_maker, amount)

            self.update_user_balance(new_contract, -amount["amount"])

