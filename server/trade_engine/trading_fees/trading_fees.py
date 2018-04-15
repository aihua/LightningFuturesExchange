from transactional_data_structures.transactional import Transactional
import math


class TradingFees(Transactional):
    MAKER_FEE = 0.0005
    TAKER_FEE = 0.001

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

    def subscribe_to_events(self, events):
        events.subscribe("get_place_order_amount", self.get_place_order_amount)
        events.subscribe("get_execute_order_amount", self.get_place_order_amount)

    def get_place_order_amount(self, order, amount):
        equity = self.trade_engine.equity_list.get_equity(order)
        order_total = (order.price / equity.decimal_points_price) * order.quantity
        fee = self.MAKER_FEE
        amount["delta_balance"] += math.ceil(order_total * fee)

    def get_execute_order_amount(self, order, amount, is_maker=False):
        equity = self.trade_engine.equity_list.get_equity(order)
        order_total = (order.price / equity.decimal_points_price) * order.quantity
        fee = self.MAKER_FEE if is_maker else self.TAKER_FEE
        amount["delta_balance"] += math.ceil(order_total * fee)
