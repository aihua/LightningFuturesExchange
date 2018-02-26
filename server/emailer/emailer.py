from shared.shared import db, app
from models.models.email import Email
import datetime


def send_email(address, subject, body):
    if app.config['SAVE_EMAILS']:
        email = Email(address=address, subject=subject, body=body, sent_date=datetime.datetime.utcnow())
        db.session.add(email)
        db.session.commit()
