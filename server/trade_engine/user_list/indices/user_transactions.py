from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_dictionary_array_version import DictionaryDictionaryArrayVersion
from models.models.transaction import Transaction


class UserTransactions(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.transactions = DictionaryDictionaryArrayVersion(
            {},
            Transaction.id_comparer,
            "user_id",
            "equity_id",
            key_1_resolver=Transaction.get_user_ids,
            model_name="transactions",
            events=self.trade_engine.events
        )

