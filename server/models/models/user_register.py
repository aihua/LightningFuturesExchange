from shared.shared import db, app
from validate_email import validate_email
import datetime
import uuid
import hashlib
import re

class UserRegister(db.Model):
    registration_token = db.Column(db.String(100), primary_key=True, nullable=False)
    username = db.Column(db.String(100), index=True, nullable=False)
    email = db.Column(db.String(200), index=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    registration_date = db.Column(db.DateTime(), nullable=False)

    def __init__(self):
        return

    def __init__(self, dic):
        self.from_dic(dic)

    def is_valid(self):
        if not re.match('^[a-zA-Z0-9_\-]{6,}$', self.username):
            return False
        if self.email.strip() == '':
            return False
        if not validate_email(self.email):
            return False
        if len(self.password) < 8:
            return False
        return True

    def set_password(self, password):
        self.password = hashlib.sha512((password + app.config['SALT']).encode('utf-8')).hexdigest()

    def from_dic(self, dic):
        self.registration_token = uuid.uuid4()
        self.username = dic.get("username", "")
        self.email = dic.get("email", "")
        self.password = dic.get("password", "")
        self.registration_date = datetime.datetime.utcnow()

    def to_dic(self):
        return {
            "registrationToken": self.registration_token,
            "username": self.username,
            "email": self.email,
            "registrationDate": self.registration_date
        }
