from shared.shared import db
from models.models.deposit_address import DepositAddress
import datetime
from shared.shared import app
import os


def create_new_deposit_address(user):
    current_address_count = CurrentAddressCount.query.filter_by(id=1).first()

    if current_address_count is None:
        current_address_count = CurrentAddressCount(id=1, address_index=0)
        db.session.add(current_address_count)
    else:
        current_address_count.address_index += 1

    address = os.popen(
        "node " + os.path.dirname(__file__) + "/../../nodejs/get_address.js " + app.config['XPUB'] + " " + str(current_address_count.address_index)
    ).read().strip()

    deposit_address = DepositAddress(
        user_id=user.user_id,
        address_id=current_address_count.address_index,
        address=address,
        created_date=datetime.datetime.utcnow()
    )

    db.session.add(deposit_address)
    return address


class CurrentAddressCount(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    address_index = db.Column(db.Integer, nullable=False)

