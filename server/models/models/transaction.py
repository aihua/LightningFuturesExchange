from shared.shared import db
import copy


class Transaction(db.Model):
    equity_id = db.Column(db.Integer, primary_key=True, nullable=False)
    transaction_id = db.Column(db.Integer, primary_key=True, nullable=False)
    user_id_long = db.Column(db.Integer, nullable=False)
    user_id_short = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.BigInteger, nullable=False)
    price = db.Column(db.BigInteger, nullable=False)
    is_buy = db.Column(db.Boolean, nullable=False)
    created_date = db.Column(db.DateTime(), nullable=False)

    @staticmethod
    def id_comparer(item1, item2):
        return 1 if item1.transaction_id < item2.transaction_id else -1 if item1.transaction_id > item2.transaction_id else 0

    def clone(self):
        return copy.copy(self)

    def copy_values(self, item):
        self.__dict__.update(item.__dict__)

    @staticmethod
    def get_user_ids(item):
        result = [item.user_id_long]
        if item.user_id_long != item.user_id_short:
            result.append(item.user_id_short)
        return result


db.Index(
    'ix_transaction_user_id_long_equity_id_user_id_short',
    Transaction.user_id_long,
    Transaction.equity_id,
    Transaction.transaction_id,
    Transaction.user_id_short
)

db.Index(
    'ix_transaction_user_id_short_equity_id_user_id_long',
    Transaction.user_id_short,
    Transaction.equity_id,
    Transaction.transaction_id,
    Transaction.user_id_long
)
