from shared.shared import db


class OrderBook(db.Model):
    equity_id = db.Column(db.Integer, primary_key=True, nullable=False)
    user_id = db.Column(db.Integer, primary_key=True, nullable=False)
    order_id = db.Column(db.BigInteger, primary_key=True, index=True, nullable=False)
    contract_id = db.Column(db.BigInteger, nullable=False)
    quantity = db.Column(db.BigInteger, nullable=False)
    is_trigger_order = db.Column(db.Boolean, nullable=False)
    trigger_above = db.Column(db.Boolean, nullable=False)
    trigger_price = db.Column(db.BigInteger, nullable=False)
    price = db.Column(db.BigInteger, nullable=False)
    filled_quantity = db.Column(db.BigInteger, nullable=False)
    status = db.Column(db.Integer, nullable=False)
    created_date = db.Column(db.DateTime(), nullable=False)
    closed_date = db.Column(db.DateTime(), nullable=False)


db.Index('ix_order_book_user_id_equity_id', OrderBook.user_id, OrderBook.equity_id, OrderBook.order_id)
