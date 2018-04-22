from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_array_version import DictionaryArrayVersion
from models.models.order import Order
from transactional_data_structures.events import EventReturnType

class TriggerOrders(Transactional):
    def __init__(self):
        self.orders_to_trigger = None

    def __init__(self, order_book, is_long):
        self.order_book = order_book
        self.trade_engine = order_book.trade_engine
        self.is_long = is_long

        self.orders_to_trigger = None

        comparer = Order.trigger_price_comparer_dec if is_long else Order.trigger_price_comparer
        is_in_item = Order.is_opened_long_trigger if is_long else Order.is_opened_short_trigger

        self.orders = DictionaryArrayVersion(
            {},
            comparer,
            "equity_id",
            is_in_item=is_in_item,
            model_name="orders",
            events=self.trade_engine.events
        )

        self.subscribe_events(self.trade_engine.events)

    def add_order_to_trigger(self, trigger_order):
        if self.orders_to_trigger is None:
            self.orders_to_trigger = []

        self.orders_to_trigger.append(trigger_order)

    def subscribe_events(self, events):
        events.subscribe("execute_order", self.execute_order)
        events.subscribe("set_equities_price", self.set_equities_price)

    def execute_order(self, order):
        if not order.is_only_trigger():
            return EventReturnType.CONTINUE

        equity = self.trade_engine.equity_list.get_equity(order.equity_id)

        if order.should_trigger_execute(equity):
            order.execute_trigger()
            return EventReturnType.RESTART

        return EventReturnType.CONTINUE

    def set_equities_price(self, new_equity, old_equity):
        order_book = self.trade_engine.order_book

        is_increasing = new_equity.current_price > old_equity.current_price

        orders = self.orders.get_list(new_equity)

        if is_increasing == self.is_long:
            while orders.get_length() > 0:
                order = orders.get_index(0)
                if (self.is_long and new_equity.current_price >= order.trigger_price) or \
                   (not self.is_long and new_equity.current_price <= order.trigger_price):
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
