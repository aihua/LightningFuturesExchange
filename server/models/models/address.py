from shared.shared import db


class Address(db.Model):
    Address = db.Column(db.String(100), primary_key=True, nullable=False)
    isTaken = db.Column(db.Boolean, nullable=False)
