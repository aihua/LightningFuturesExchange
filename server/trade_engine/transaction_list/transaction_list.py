from trade_engine.dictionary_array_version import DictionaryArrayVersion, Transactional, DictionaryAutoIncrementerVersion
from models.models.transaction import Transaction
from trade_engine.events.events import EventReturnType


class TransactionList(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.transactions = DictionaryArrayVersion({}, Transaction.id_comparer, "equity_id", model_name="transactions", events=self.trade_engine.events)
        self.transactions_id = DictionaryAutoIncrementerVersion({})

    def subscribe_to_events(self, events):
        pass

    def initialize(self):
        return

    def get_next_id(self):
        self.transactions_id.get_next_id()
