from shared.shared import db


class Email(db.Model):
    email_id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    address = db.Column(db.String(2000), nullable=False)
    sent_date = db.Column(db.DateTime(), nullable=False, index=True)
    subject = db.Column(db.String(2000), nullable=False)
    body = db.Column(db.Text, nullable=False)
