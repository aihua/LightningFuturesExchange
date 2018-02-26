from shared.shared import db
from validate_email import validate_email
import uuid
import datetime

class ChangeEmail(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, nullable=False)
    change_email_token = db.Column(db.String(100), primary_key=True, nullable=False)
    new_email = db.Column(db.String(200), nullable=False)
    created_date = db.Column(db.DateTime(), nullable=False)

    def __init__(self):
        return

    def __init__(self, dic):
        self.from_dic(dic)

    def is_valid(self):
        if self.user_id < 0:
            return False
        if self.new_email.strip() == '':
            return False
        if not validate_email(self.new_email):
            return False
        return True

    def from_dic(self, dic):
        self.change_email_token = uuid.uuid4()
        try:
            self.user_id = int(dic.get("userId", ""))
        except:
            self.user_id = -1
        self.new_email = dic.get("newEmail", "")
        self.created_date = datetime.datetime.utcnow()
