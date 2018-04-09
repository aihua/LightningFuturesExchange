from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_array_version import DictionaryArrayVersion
from transactional_data_structures.auto_incrementer_version import AutoIncrementerVersion

from models.models.contract import Contract


class ContractList(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.contracts = DictionaryArrayVersion({}, Contract.id_comparer, "equity_id", model_name="contracts", events=self.trade_engine.events)
        self.contracts_id = AutoIncrementerVersion({})

        self.subscribe_to_events(trade_engine.events)

    def subscribe_to_events(self, events):
        events.subscribe("make_order", self.make_order)

    def initialize(self):
        return

    def get_next_id(self):
        self.transactions_id.get_next_id()

    def make_order(self, order, matched_order):
        quantity = min(order.quantity, matched_order.quantity)
        self.trade_engine.trigger("make_contract", order, matched_order.price, quantity, False)
        self.trade_engine.trigger("make_contract", matched_order, matched_order.price, quantity, True)
