from trade_engine.dictionary_array_version import DictionaryArrayVersion, Transactional
from models.models.order import Order
from trade_engine.events.events import EventReturnType

class TriggerOrders(Transactional):
    def __init__(self):
        pass

    def __init__(self, order_book, is_long):
        self.order_book = order_book
        self.trade_engine = order_book.trade_engine
        self.is_long = is_long

        comparer = Order.trigger_price_comparer_dec if is_long else Order.trigger_price_comparer
        is_in_item = Order.is_opened_long_trigger if is_long else Order.is_opened_short_trigger

        self.orders = DictionaryArrayVersion({}, comparer, "equity_id", is_in_item=is_in_item, model_name="orders", events=self.trade_engine.events)
        self.subscribe_events(self.trade_engine.events)

    def subscribe_events(self, events):
        events.subscribe("execute_order", self.execute_order)

    def execute_order(self, order):
        if not order.is_only_trigger():
            return EventReturnType.CONTINUE

        equity = self.trade_engine.equity_list.get_equity(order.equity_id)

        if order.should_trigger_execute(equity):
            order.execute_trigger()
            return EventReturnType.RESTART

        return EventReturnType.CONTINUE