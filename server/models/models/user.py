from shared.shared import db, app
import datetime
import hashlib
import pyotp
import math
import copy


class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    two_f_a_token = db.Column(db.String(100), nullable=False)
    two_f_a_enabled = db.Column(db.Boolean, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    balance = db.Column(db.BigInteger, nullable=False)
    is_margin_called = db.Column(db.Boolean, nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False)
    registration_date = db.Column(db.DateTime(), nullable=False)

    def __init__(self):
        self.margin_used = 0
        self.margin_used_percent = 0.0
        self.margin_used_orders = 0
        self.margin_used_orders_percent = 0.0

    def __init__(self, user_register):
        self.margin_used = 0
        self.margin_used_percent = 0.0
        self.margin_used_orders = 0
        self.margin_used_orders_percent = 0.0
        self.from_user_register(user_register)

    def clone(self):
        return copy.copy(self)

    def copy_values(self, item):
        self.__dict__.update(item.__dict__)

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
        self.is_margin_called = False
        self.is_admin = False
        self.registration_date = datetime.datetime.utcnow()

    def to_dic(self):
        return {
            "userId": self.user_id,
            "username": self.username,
            "email": self.email,
            "twoFactorEnabled": self.two_f_a_enabled,
            "balance": int(self.balance),
            "isMarginCalled": self.is_margin_called,
            "isAdmin": self.is_admin,
            "registrationDate": self.registration_date
        }

    @staticmethod
    def margin_used_percent_comparer_dec(item1, item2):
        comp = 1 if item1.margin_used_percent > item2.margin_used_percent else -1 if item1.margin_used_percent < item2.margin_used_percent else 0
        if comp != 0:
            return comp

        return -1 if item1.user_id > item2.user_id else 1 if item1.user_id < item2.user_id else 0

    @staticmethod
    def margin_used_orders_percent_comparer_dec(item1, item2):
        comp = 1 if item1.margin_used_orders_percent > item2.margin_used_orders_percent else -1 if item1.margin_used_orders_percent < item2.margin_used_orders_percent else 0
        if comp != 0:
            return comp

        return -1 if item1.user_id > item2.user_id else 1 if item1.user_id < item2.user_id else 0

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
        pass

    def can_execute_order(self, order, next_price):
        pass

    def add_to_balance_and_margin(self, balance, margin, margin_orders, bitcoin_price):
        self.balance += math.floor(balance)
        self.margin_used += math.ceil(margin)
        self.margin_used_orders += math.ceil(margin_orders)
        self.margin_used_percent = self.margin_used / (self.balance + 0.0)
        self.margin_used_orders_percent = self.margin_used_orders / (self.balance + 0.0)

        if self.is_margin_called and self.margin_used_percent / bitcoin_price < 1.0:
            self.is_margin_called = False
