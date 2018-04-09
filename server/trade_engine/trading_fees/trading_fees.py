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
        events.subscribe("user_create_contract_fee", self.user_create_contract_fee)
        events.subscribe("user_update_contract_fee", self.user_update_contract_fee)

    def get_place_order_amount(self, order, amount):
        amount["amount"] += 0

    def get_execute_order_amount(self, order, amount):
        order_total = order.price * order.quantity
        fee = self.TAKER_FEE
        amount["amount"] += math.ceil(order_total * fee)

    def update_amount(self, contract, quantity, is_maker, amount):
        order_total = (contract.price / contract.PRICE_MULTIPLIER) * quantity
        fee = self.MAKER_FEE if is_maker else self.TAKER_FEE
        amount["amount"] += math.ceil(order_total * fee)

    def user_create_contract_fee(self, contract, quantity, is_maker, amount):
        self.update_amount(contract, quantity, is_maker, amount)

    def user_update_contract_fee(self, new_contract, old_contract, is_maker, amount):
        self.update_amount(new_contract, new_contract.quantity - old_contract.quantity, is_maker, amount)
