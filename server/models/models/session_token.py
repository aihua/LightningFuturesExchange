from shared.shared import db


class SessionToken(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, nullable=False)
    session_token = db.Column(db.String(100), primary_key=True, nullable=False)
    ip_address = db.Column(db.String(100), nullable=False)
    issued_date = db.Column(db.DateTime(), nullable=False)
    expiry_date = db.Column(db.DateTime(), nullable=False)