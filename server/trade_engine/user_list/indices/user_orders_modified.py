from trade_engine.dictionary_array_version import DictionaryArrayVersion, Transactional, \
    DictionaryAutoIncrementerVersion
from models.models.transaction import Transaction
from trade_engine.events.events import EventReturnType


class UserOrdersModified(Transactional):
    def __init__(self):
        pass

    def subscribe_to_events(self, events):
        pass