from shared.shared import db


class EquityPriceId(db.Model):
    equity_Id = db.Column(db.Integer, primary_key=True, nullable=False)
    equity_price_id = db.Column(db.Integer, nullable=False)