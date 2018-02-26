from shared.shared import db


class OrderBook(db.Model):
    orderId = db.Column(db.BigInteger, primary_key=True, nullable=False)
    userId = db.Column(db.Integer, index=True, nullable=False)
    equityId = db.Column(db.Integer, index=True, nullable=False)
    contractId = db.Column(db.BigInteger, nullable=False)
    quantity = db.Column(db.DECIMAL(18, 10), nullable=False)
    isTriggerOrder = db.Column(db.Boolean, nullable=False)
    triggerAbove = db.Column(db.Boolean, nullable=False)
    triggerPrice = db.Column(db.DECIMAL(18, 10), nullable=False)
    price = db.Column(db.DECIMAL(18, 10), nullable=False)
    filledQuantity = db.Column(db.DECIMAL(18, 10), nullable=False)
    status = db.Column(db.Integer, nullable=False)
    createdDate = db.Column(db.DateTime(), nullable=False)
    closedDate = db.Column(db.DateTime(), nullable=False)


db.Index('ix_orderBook_userId_equityId', OrderBook.userId, OrderBook.equityId)