from shared.shared import db


class Withdrawal(db.Model):
    userId = db.Column(db.Integer, primary_key=True, nullable=False)
    withdrawalId = db.Column(db.Integer, primary_key=True, nullable=False)
    address = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.DECIMAL(18, 10), nullable=False)
    withdrawalToken = db.Column(db.String(100), nullable=False)
    status = db.Column(db.Integer, nullable=False)
    transactionId = db.Column(db.String(100), nullable=False)
    createdDate = db.Column(db.DateTime(), nullable=False)
    confirmedDate = db.Column(db.DateTime(), nullable=False)
