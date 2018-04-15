from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_array_version import DictionaryArrayVersion
from transactional_data_structures.auto_incrementer_version import AutoIncrementerVersion
from models.models.transaction import Transaction
import datetime

class TransactionList(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.transactions = DictionaryArrayVersion(
            {},
            Transaction.id_comparer,
            "equity_id",
            model_name="transactions",
            events=self.trade_engine.events,
            update_db=True
        )

        self.transactions_id = AutoIncrementerVersion({})

    def subscribe_to_events(self, events):
        events.subscribe("match_orders", self.match_orders)

    def initialize(self):
        return

    def get_next_id(self):
        self.transactions_id.get_next_id()

    def match_orders(self, order, matched_order):
        self.trade_engine.trigger(
            "transactions_insert_item",
            Transaction(
                equity_id=order.equity_id,
                transaction_id=self.get_next_id(),
                user_id_long=order.user_id if order.is_long else matched_order.user_id,
                user_id_short=matched_order.user_id if order.is_long else order.user_id,
                quantity=min(order.quantity, matched_order.quantity),
                price=matched_order.price,
                is_buy=order.is_long,
                created_date=datetime.datetime.utcnow()
            )
        )
