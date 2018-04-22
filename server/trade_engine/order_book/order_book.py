from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_array_version import DictionaryArrayVersion
from transactional_data_structures.dictionary_auto_incrementer_version import DictionaryAutoIncrementerVersion

from models.models.order import OrderType, OrderStatus, Order
from models.models.order_id import OrderId
from transactional_data_structures.events import Events, EventPriority
from indices.limit_orders import LimitOrders
from indices.trigger_orders import  TriggerOrders
from indices.trailing_orders import TrailingOrders
from helpers.helper import quick_sort

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

        self.orders_id = DictionaryAutoIncrementerVersion(
            {},
            "equity_id",
            "order_id",
            OrderId
        )

        self.limit_order_longs = LimitOrders(self.trade_engine, True)
        self.limit_order_shorts = LimitOrders(self.trade_engine, False)

        self.trigger_order_longs = TriggerOrders(self.trade_engine, True)
        self.trigger_order_shorts = TriggerOrders(self.trade_engine, False)

        self.trailing_order_longs = TrailingOrders(self.trade_engine, True)
        self.trailing_order_shorts = TrailingOrders(self.trade_engine, False)

        self.subscribe_to_events(trade_engine.events)

        self.triggered_orders = None
        self.temp_triggered_orders = None

        self.executing_user = None

    def add_triggered_order(self, order):
        if self.temp_triggered_orders is None:
            self.temp_triggered_orders = []

        self.temp_triggered_orders.append(order)

    def subscribe_to_events(self, events):
        events.subscribe("place_order", self.place_order_simple)
        events.subscribe("cancel_order", self.cancel_order_simple)
        events.subscribe("match_orders", self.match_orders)
        events.subscribe("set_equities_price", self.merge_triggered_orders, EventPriority.POST_EVENT)
        events.subscribe("execute_trigger_orders", self.execute_trigger_orders)

    def merge_triggered_orders(self, new_equity, old_equity):
        if len(self.temp_triggered_orders) == 0:
            return
        if new_equity.current_price > old_equity.current_price:
            quick_sort(self.temp_triggered_orders, Order.trailing_price_comparer())
        else:
            quick_sort(self.temp_triggered_orders, Order.trailing_price_comparer_dec)

        self.triggered_orders.extend(self.temp_triggered_orders)

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

    def get_next_id(self, order):
        return self.orders_id.get_next_id(order)

    def place_order(self, order, is_margin_call=False):
        if self.executing_user_id is None:
            self.executing_user_id = order.user_id

        order.order_id = self.get_next_id(order)
        order.modification_id = order.order_id

        if self.orders.get_item(order) is None:
            self.trade_engine.events.trigger("orders_insert_item", order)

        if not Events.executed(self.trade_engine.events.trigger("execute_order", order, is_margin_call)):
            self.trade_engine.events.trigger("place_order", order)
            return False
        return True

    def cancel_order(self, order):
        new_order = order.clone()

        new_order.modification_id = self.get_next_id(order)
        new_order.closed_date = datetime.datetime.utcnow()
        new_order.status = OrderStatus.CLOSED

        self.trade_engine.events.trigger("cancel_order", new_order, order)

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

        matched_order.modified_id = self.get_next_id(order)
        matched_order.filled_quantity += quantity

        if matched_order.is_filled():
            matched_order.close()

        self.trade_engine.events.trigger("orders_update_item", matched_order, old_matched_order)

    def execute_trigger_orders(self):
        temp_trigger_orders = self.trigger_orders
        self.trigger_orders = None

        for trigger_order in temp_trigger_orders:
            self.place_order(trigger_order)
