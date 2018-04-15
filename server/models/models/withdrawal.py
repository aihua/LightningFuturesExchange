from shared.shared import db
import copy


class Withdrawal(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, nullable=False)
    withdrawal_id = db.Column(db.Integer, primary_key=True, nullable=False)
    address = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.BigInteger, nullable=False)
    withdrawal_token = db.Column(db.String(100), nullable=False)
    cancelled = db.Column(db.Boolean, nullable=False)
    transaction_id = db.Column(db.String(100), nullable=False)
    created_date = db.Column(db.DateTime(), nullable=False)
    confirmed_date = db.Column(db.DateTime())
    sent_date = db.Column(db.DateTime())

    def to_dic(self):
        return {
            "userId": self.user_id,
            "withdrawalId": self.withdrawal_id,
            "address": self.address,
            "amount": self.amount,
            "cancelled": self.cancelled,
            "transactionId": self.transaction_id,
            "createdDate": self.created_date,
            "confirmedDate": self.confirmed_date,
            "sentDate": self.sent_date
        }

    def clone(self):
        return copy.copy(self)

    def copy_values(self, item):
        self.__dict__.update(item.__dict__)
