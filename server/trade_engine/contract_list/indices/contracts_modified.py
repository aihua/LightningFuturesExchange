from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_array_version import DictionaryArrayVersion
from models.models.contract import Contract


class ContractsModified(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.contracts = DictionaryArrayVersion(
            {},
            Contract.modified_id_comparer,
            "equity_id",
            model_name="contracts",
            events=self.trade_engine.events
        )
