from shared.shared import db


class DepositAddress(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, nullable=False)
    address_id = db.Column(db.Integer, primary_key=True, nullable=False)
    address = db.Column(db.String(100), nullable=False)
    created_date = db.Column(db.DateTime(), nullable=False)

    def to_dic(self):
        return {
            "userId": self.user_id,
            "addressId": self.address_id,
            "address": self.address,
            "createdDate": self.created_date
        }
