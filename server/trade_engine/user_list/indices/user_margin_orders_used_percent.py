from transactional_data_structures.transactional import Transactional
from transactional_data_structures.events import EventReturnType
from transactional_data_structures.versioned_ordered_array import VersionedOrderedArray
from models.models.user import User


class UserMarginOrdersUsedPercent(Transactional):
    def __int__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.users = VersionedOrderedArray(
            [],
            None,
            User.margin_used_orders_percent_comparer_dec,
        )

    def subscribe_to_events(self, events):
        events.subscribe("check_margin_orders", self.check_margin_orders)

    def check_margin_orders(self):
        bitcoin_price = self.trade_engine.get_bitcoin_price()

        executed_margin_call = False

        for user in self.users:
            if user.margin_used_orders_percent / bitcoin_price >= 1.0:
                executed_margin_call = True
                self.trade_engine.events.trigger("user_order_margin_call", user)
            else:
                break

        return EventReturnType.STOP if executed_margin_call else EventReturnType.CONTINUE
