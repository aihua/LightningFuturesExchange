from shared.shared import db


class EquityPrice(db.Model):
    equityId = db.Column(db.Integer, primary_key=True, nullable=False)
    equityPriceId = db.Column(db.Integer, primary_key=True, nullable=False)
    price = db.Column(db.DECIMAL(18, 10), nullable=False)
    priceDate = db.Column(db.DateTime(), nullable=False)