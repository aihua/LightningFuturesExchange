from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_array_version import DictionaryArrayVersion
from models.models.order import Order
from transactional_data_structures.events import EventReturnType


class TrailingOrders(Transactional):
    def __init__(self):
        self.orders_to_trigger = None

    def __init__(self, order_book, is_long):
        self.order_book = order_book
        self.trade_engine = order_book.trade_engine
        self.is_long = is_long

        comparer = Order.trailing_price_comparer_dec if is_long else Order.trailing_price_comparer
        comparer_max = Order.trailing_price_max_comparer if is_long else Order.effective_price_max_comparer_dec

        is_in_item = Order.is_opened_long_trailing if is_long else Order.is_opened_short_trailing

        self.orders_to_trigger = None

        self.orders = DictionaryArrayVersion(
            {},
            comparer,
            "equity_id",
            is_in_item=is_in_item,
            model_name="orders",
            events=self.trade_engine.events
        )

        self.orders_max = DictionaryArrayVersion(
            {},
            comparer_max,
            "equity_id",
            is_in_item=is_in_item,
            model_name="orders",
            events=self.trade_engine.events
        )

        self.subscribe_to_events(self.trade_engine.events)

    def subscribe_events(self, events):
        events.subscribe("execute_order", self.execute_order)
        events.subscribe("set_equities_price", self.set_equities_price)

    def execute_order(self, order):
        if not order.is_only_trailing():
            return EventReturnType.CONTINUE

        equity = self.trade_engine.equity_list.get_equity(order.equity_id)

        order.set_trailing_price(equity)

        return EventReturnType.CONTINUE

    def set_equities_price(self, new_equity, old_equity):
        order_book = self.trade_engine.order_book

        is_increasing = new_equity.current_price > old_equity.current_price

        if is_increasing == self.is_long:
            # Check Trailing
            orders_max = self.orders_max.get_list(new_equity)

            while orders_max.get_length() > 0:
                order = orders_max.get_index(0)
                if (self.is_long and new_equity.current_price >= order.trailing_price_max) or \
                   (not self.is_long and new_equity.current_price <= order.trailing_price_max):
                    new_order = order.clone()
                    new_order.set_trailing_price(new_equity)
                    self.trade_engine.events.trigger("orders_update_item", new_order, order)
                else:
                    break
        else:
            # Check Trigger
            orders = self.orders.get_list(new_equity)

            while orders.get_length() > 0:
                order = orders.get_index(0)
                if (not self.is_long and new_equity.current_price >= order.trailing_price) or \
                   (self.is_long and new_equity.current_price <= order.trailing_price):
                    new_order = order.clone()
                    order_book.add_triggered_order(
                        new_order.close_and_create_triggered_order(
                            order_book.get_next_id(new_order),
                            new_equity.current_price
                        )
                    )
                    self.trade_engine.events.trigger("orders_update_item", new_order, order)
                else:
                    break
