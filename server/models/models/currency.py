from shared.shared import db


class Currency(db.Model):
    currency_id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    symbol = db.Column(db.String(5), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price_decimal_point = db.Column(db.Integer, nullable=False)

    def __init__(self):
        self.price = 0
