from trade_engine.dictionary_array_version import DictionaryVersion, Transactional, DictionaryAutoIncrementerVersion
from trade_engine.events.events import EventPriority
from models.models.order import OrderStatus
import datetime


class UserList(Transactional):
    def __init__(self, trade_engine):
        self.trade_engine = trade_engine
        self.users = DictionaryVersion({}, "user_id", model_name="users", events=trade_engine.events)
        self.subscribe_to_events(trade_engine.events)

    def subscribe_to_events(self, events):
        events.subscribe("place_order", self.user_can_place_order, EventPriority.VALIDATION)
        events.subscribe("match_order", self.check_user_can_execute_order, EventPriority.VALIDATION)

    def check_user_can_place_order(self, order):
        user = self.users.get_item(order)

        order_amount = {"amount": 0}

        self.trade_engine.events.trigger("get_place_order_amount", order, order_amount)

        if not user.can_place_order(order_amount["amount"]):
            raise Exception("InsufficientFunds")

    def check_user_can_execute_order(self, order, matched_order):
        user = self.users.get_item(order)

        order_amount = {"amount": 0}

        self.trade_engine.events.trigger("get_execute_order_amount", order, order_amount)

        if not user.can_execute_order(order, order_amount["amount"]):
            raise Exception("InsufficientFunds")
