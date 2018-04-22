from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_array_version import DictionaryArrayVersion
from transactional_data_structures.dictionary_auto_incrementer_version import DictionaryAutoIncrementerVersion
from models.models.transaction import Transaction
from models.models.transaction_id import TransactionId
import datetime
import math


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

        self.transactions_id = DictionaryAutoIncrementerVersion(
            {},
            "equity_id",
            "transaction_id",
            TransactionId
        )

    def subscribe_to_events(self, events):
        events.subscribe("match_orders", self.match_orders)
        events.subscribe("transfer_funds", self.match_orders)

    def initialize(self):
        return

    def get_next_id(self, transaction):
        self.transactions_id.get_next_id(transaction)

    def match_orders(self, order, matched_order):
        self.trade_engine.trigger(
            "transactions_insert_item",
            Transaction(
                equity_id=order.equity_id,
                transaction_id=self.get_next_id(order),
                user_id_long=order.user_id if order.is_long else matched_order.user_id,
                user_id_short=matched_order.user_id if order.is_long else order.user_id,
                quantity=min(order.quantity, matched_order.quantity),
                price=matched_order.price,
                is_buy=order.is_long,
                created_date=datetime.datetime.utcnow()
            )
        )

    def transfer_funds(self, user_long, user_short, amount):
        self.trade_engine.trigger(
            "transactions_insert_item",
            Transaction(
                equity_id=0,
                transaction_id=self.get_next_id(Transaction(entity_id=0)),
                user_id_long=user_long.user_id,
                user_id_short=user_short.user_id,
                quantity=amount,
                price=math.ceil(self.trade_engine.get_bitcoin_price),
                is_buy=False,
                created_date=datetime.datetime.utcnow()
            )
        )
