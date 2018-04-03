from trade_engine.dictionary_array_version import DictionaryDictionaryArrayVersion, Transactional
from models.models.contract import Contract
from trade_engine.events.events import EventReturnType

class UserContractsModified(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.contracts = DictionaryDictionaryArrayVersion(
            {},
            Contract.modified_id_comparer,
            "equity_id",
            model_name="contracts",
            events=self.trade_engine.events
        )

    def subscribe_to_events(self, events):
        pass