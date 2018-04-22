from transactional_data_structures.transactional import Transactional
from transactional_data_structures.events import EventReturnType
from transactional_data_structures.versioned_ordered_array import VersionedOrderedArray
from models.models.user import User


class UserMarginUsedPercent(Transactional):
    def __int__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.users = VersionedOrderedArray(
            [],
            None,
            User.margin_used_percent_comparer_dec,
        )

    def subscribe_to_events(self, events):
        events.subscribe("check_margin", self.check_margin_orders)

    def check_margin_orders(self):
        bitcoin_price = self.trade_engine.get_bitcoin_price()

        did_margin_call = False

        margin_user = None

        while True:
            if did_margin_call:
                self.trade_engine.events.trigger("check_margin_orders")

            for user in self.users:
                if user.margin_used_percent / bitcoin_price >= 1.0:
                    margin_user = user
                    did_margin_call = True
                    break
                else:
                    break

            if margin_user is not None:
                self.trade_engine.events.trigger("user_margin_call", user)
            else:
                break

        return EventReturnType.STOP if did_margin_call else EventReturnType.CONTINUE
