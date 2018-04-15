from shared.shared import db
import copy


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

    def clone(self):
        return copy.copy(self)

    def copy_values(self, item):
        self.__dict__.update(item.__dict__)
