from shared.shared import db, app
import datetime
import hashlib
import pyotp


class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    two_f_a_token = db.Column(db.String(100), nullable=False)
    two_f_a_enabled = db.Column(db.Boolean, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    balance = db.Column(db.BigInteger, nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False)
    registration_date = db.Column(db.DateTime(), nullable=False)

    def __init__(self):
        self.init_calculated_field()

    def __init__(self, user_register):
        self.init_calculated_field()

    def init_calculated_field(self):
        self.margin_used = 0
        self.margin_used_percent = 0.0
        self.margin_used_orders = 0
        self.margin_used_orders_percent = 0.0

    def from_user_register(self, user_register):
        self.username = user_register.username
        self.email = user_register.email
        self.two_f_a_token = ""
        self.two_f_a_enabled = False
        self.password = user_register.password
        self.balance = 0.0
        self.is_admin = False
        self.registration_date = datetime.datetime.utcnow()

    def to_dic(self):
        return {
            "userId": self.user_id,
            "username": self.username,
            "email": self.email,
            "twoFactorEnabled": self.two_f_a_enabled,
            "balance": int(self.balance),
            "isAdmin": self.is_admin,
            "registrationDate": self.registration_date
        }

    def check_password(self, password):
        return hashlib.sha512((password + app.config['SALT']).encode('utf-8')).hexdigest() == self.password

    def check_token(self, token):
        if not self.two_f_a_enabled:
            return True

        totp = pyotp.TOTP(self.two_f_a_token)
        return totp.verify(token)

    def set_password(self, password):
        self.password = hashlib.sha512((password + app.config['SALT']).encode('utf-8')).hexdigest()

    def can_place_order(self, order):
        return False

    def can_execute_order(self, order, next_price):
        return False
