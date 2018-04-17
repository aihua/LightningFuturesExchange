from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_array_version import DictionaryArrayVersion
from transactional_data_structures.auto_incrementer_version import AutoIncrementerVersion

from models.models.order import OrderType, OrderStatus, Order
from transactional_data_structures.events import Events
from indices.limit_orders import LimitOrders
from indices.trigger_orders import  TriggerOrders
from indices.trailing_orders import TrailingOrders

import datetime


class OrderBook(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.orders = DictionaryArrayVersion(
            {},
            Order.id_comparer,
            "equity_id",
            model_name="orders",
            events=self.trade_engine.events
        )

        self.orders_id = AutoIncrementerVersion({})

        self.limit_order_longs = LimitOrders(self.trade_engine, True)
        self.limit_order_shorts = LimitOrders(self.trade_engine, False)

        self.trigger_order_longs = TriggerOrders(self.trade_engine, True)
        self.trigger_order_shorts = TriggerOrders(self.trade_engine, False)

        self.trailing_order_longs = TrailingOrders(self.trade_engine, True)
        self.trailing_order_shorts = TrailingOrders(self.trade_engine, False)

        self.subscribe_to_events(trade_engine.events)

    def subscribe_to_events(self, events):
        events.subscribe("place_order", self.place_order_simple)
        events.subscribe("cancel_order", self.cancel_order_simple)
        events.subscribe("match_orders", self.match_orders)

    def get_limit_orders_long(self, order):
        return self.limit_order_longs.orders.get_list(order)

    def get_limit_orders_short(self, order):
        return self.limit_order_shorts.orders.get_list(order)

    def get_trigger_orders_long(self, order):
        return self.trigger_order_longs.orders.get_list(order)

    def get_trigger_orders_short(self, order):
        return self.trigger_order_shorts.orders.get_list(order)

    def get_trailing_orders_short(self, order):
        return self.trailing_order_shorts.orders.get_list(order)

    def get_trailing_orders_short(self, order):
        return self.trailing_order_shorts.orders.get_list(order)

    def get_list_of_all_orders(self, order):
        return [
            self.get_limit_orders_long(order),
            self.get_limit_orders_short(order),
            self.get_trigger_orders_long(order),
            self.get_trigger_orders_short(order),
            self.get_trailing_orders_long(order),
            self.get_trailing_orders_short(order)
        ]

    def initialize(self):
        return

    def get_next_id(self):
        return self.orders_id.get_next_id()

    def place_order(self, order, is_margin_call=False):
        order.order_id = self.get_next_id()
        order.modification_id = order.order_id

        if self.orders.get_item(order) is None:
            self.trade_engine.events.trigger("orders_insert_item", order)

        if not Events.executed(self.trade_engine.events.trigger("execute_order", order, is_margin_call)):
            self.trade_engine.events.trigger("place_order", order)
            return False
        return True

    def cancel_order(self, order):
        old_order = order.clone()

        order.modification_id = self.get_next_id()
        order.closed_date = datetime.datetime.utcnow()
        order.status = OrderStatus.CLOSED

        self.trade_engine.events.trigger("cancel_order", order, old_order)

    def place_order_simple(self, order):
        if order.order_type == OrderType.MARKET:
            new_order = order.clone()
            new_order.order_type = OrderType.LIMIT
            new_order.price = self.trade_engine.equity_list.get_equity(order.equity_id).current_price

            self.trade_engine.events.trigger("orders_update_item", new_order, order)

    def cancel_order_simple(self, order):
        if order.order_status == OrderStatus.OPENED:
            new_order = order.clone()
            new_order.close()
            self.trade_engine.events.trigger("orders_update_item", new_order, order)

    def match_orders(self, order, matched_order):
        quantity = min(order.remaining_quantity(), matched_order.remaining_quantity())

        order.filled_quantity += quantity
        if order.is_filled():
            order.close()

        old_matched_order = matched_order.clone()

        matched_order.modified_id = self.get_next_id()
        matched_order.filled_quantity += quantity

        if matched_order.is_filled():
            matched_order.close()

        self.trade_engine.events.trigger("orders_update_item", matched_order, old_matched_order)