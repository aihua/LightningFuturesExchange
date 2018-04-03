from shared.shared import db


class ExchangeFee(db.Model):
    exchange_id = db.Column(db.Integer, primary_key=True, nullable=False)
    maker_fee = db.Column(db.Integer, primary_key=True, nullable=False)
    taker_fee = db.Column(db.Integer, primary_key=True, nullable=False)