from shared.shared import db


class Contract(db.Model):
    contractId = db.Column(db.BigInteger, primary_key=True, nullable=False)
    userId = db.Column(db.Integer, index=True, nullable=False)
    equityId = db.Column(db.Integer, index=True, nullable=False)
    orderId = db.Column(db.BigInteger, nullable=False)
    quantity = db.Column(db.DECIMAL(18, 10), nullable=False)
    price = db.Column(db.DECIMAL(18, 10), nullable=False)
    status = db.Column(db.Integer, nullable=False)
    createdDate = db.Column(db.DateTime(), nullable=False)
    closedDate = db.Column(db.DateTime(), nullable=False)

db.Index('ix_contract_userId_equityId', Contract.userId, Contract.equityId)