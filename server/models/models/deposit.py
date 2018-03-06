from shared.shared import db


class Deposit(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, nullable=False)
    address_id = db.Column(db.Integer, primary_key=True, nullable=False)
    deposit_id = db.Column(db.Integer, primary_key=True, nullable=False)
    transaction_id = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.BigInteger, nullable=False)
    created_date = db.Column(db.DateTime(), nullable=False)

    def to_dic(self):
        return {
            "userId": self.user_id,
            "addressId": self.address_id,
            "depositId": self.deposit_id,
            "transactionId": self.transaction_id,
            "quantity": float(self.quantity),
            "createdDate": self.created_date
        }