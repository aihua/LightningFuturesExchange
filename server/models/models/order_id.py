from shared.shared import db


class OrderId(db.Model):
    equity_id = db.Column(db.Integer, primary_key=True, nullable=False)
    order_id = db.Column(db.Integer, nullable=False)
