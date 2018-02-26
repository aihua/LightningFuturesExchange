from shared.shared import db


class Equity(db.Model):
    equityId = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    equitySymbol = db.Column(db.String(100), nullable=False)
    equityName = db.Column(db.String(100), nullable=False)
    equityBroker = db.Column(db.String(100), nullable=False)
    tradableRequirement = db.Column(db.DECIMAL(4, 2), nullable=False)
    marginRequirement = db.Column(db.DECIMAL(4, 2), nullable=False)