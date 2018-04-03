from shared.shared import db


class ForgotPassword(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, nullable=False)
    forgot_password_token = db.Column(db.String(100), primary_key=True, nullable=False)
    created_date = db.Column(db.DateTime(), nullable=False)

