from shared.shared import db


class Deposit(db.Model):
    addressId = db.Column(db.Integer, primary_key=True, nullable=False)
    depositId = db.Column(db.Integer, primary_key=True, nullable=False)
    transactionId = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.DECIMAL(18, 10), nullable=False)
    createdDate = db.Column(db.DateTime(), nullable=False)