from shared.shared import db


class WithdrawalId(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, nullable=False)
    withdrawal_id = db.Column(db.Integer, nullable=False)