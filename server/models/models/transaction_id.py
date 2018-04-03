from shared.shared import db


class TransactionId(db.Model):
    equity_id = db.Column(db.Integer, primary_key=True, nullable=False)
    transaction_id = db.Column(db.Integer, nullable=False)
