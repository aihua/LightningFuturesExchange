from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_dictionary_array_version import DictionaryDictionaryArrayVersion
from models.models.transaction import Transaction


class UserTransactions(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine, is_long):
        self.trade_engine = trade_engine
        self.is_long = is_long

        self.transactions = DictionaryDictionaryArrayVersion(
            {},
            Transaction.id_comparer,
            "equity_id",
            "user_id_long" if is_long else "user_id_short",
            model_name="transactions",
            events=self.trade_engine.events
        )

