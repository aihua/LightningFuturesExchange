from shared.shared import db


class Equity(db.Model):
    equity_id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    equity_symbol = db.Column(db.String(100), nullable=False)
    equity_name = db.Column(db.String(100), nullable=False)
    equityBroker = db.Column(db.String(100), nullable=False)
    tradable_requirement = db.Column(db.Integer, nullable=False)
    margin_requirement = db.Column(db.Integer, nullable=False)
