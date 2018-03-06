from shared.shared import db


class DepositId(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, nullable=False)
    address_id = db.Column(db.Integer, primary_key=True, nullable=False)
    deposit_id = db.Column(db.Integer, nullable=False)