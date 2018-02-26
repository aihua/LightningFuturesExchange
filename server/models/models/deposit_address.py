from shared.shared import db


class DepositAddress(db.Model):
    userId = db.Column(db.Integer, primary_key=True, nullable=False)
    addressId = db.Column(db.Integer, primary_key=True, nullable=False)
    address = db.Column(db.String(100), nullable=False)
    createdDate = db.Column(db.DateTime(), nullable=False)