from trade_engine.dictionary_array_version import DictionaryArrayVersion, Transactional
from models.models.order import Order
from trade_engine.events.events import EventReturnType

class LimitOrders(Transactional):
    def __init__(self):
        pass

    def __init__(self, order_book, is_long):
        self.order_book = order_book
        self.trade_engine = order_book.trade_engine
        self.is_long = is_long

        comparer = Order.price_comparer_dec if is_long else Order.price_comparer
        is_in_item = Order.is_opened_long_limit if is_long else Order.is_opened_short_limit

        self.orders = DictionaryArrayVersion({}, comparer, "equity_id", is_in_item=is_in_item, model_name="orders", events=self.trade_engine.events)
        self.subscribe_events(self.trade_engine.events)

    def subscribe_events(self, events):
        events.subscribe("execute_order", self.execute_order)

    def execute_order(self, order):
        if not order.is_limit_or_market() or self.orders.get_count(order) == 0:
            return EventReturnType.CONTINUE

        matched_order = self.orders.get_index(order, 0)

        if order.intersects(matched_order):
            # Should not continue on margined orderbook and margin calls
            if not self.trade_engine.trigger("match_orders", order, matched_order):
                return EventReturnType.RESTART

            if order.remaining_quantity() == 0:
                return EventReturnType.STOP

            return EventReturnType.RESTART
        return EventReturnType.CONTINUE
