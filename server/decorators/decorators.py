from functools import wraps
from flask import request, jsonify
from models.models.user import User
from models.models.session_token import SessionToken
from shared.shared import db
import datetime


def user_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'sessiontoken' not in request.cookies and 'userid' not in request.cookies:
            return jsonify({'message': 'NoSession'}), 401

        # try:
        user_id = int(request.cookies.get("userid"))
        session_token = request.cookies.get("sessiontoken")

        session_token_item = SessionToken.query.filter_by(user_id=user_id, session_token=session_token).first()

        if session_token_item is None:
            return jsonify({'message': 'TokenNotFound'}), 401

        if session_token_item.expiry_date < datetime.datetime.utcnow():
            return jsonify({'message': 'SessionExpired'}), 401

        if session_token_item.expiry_date - datetime.datetime.utcnow() < datetime.timedelta(hours=3):
            session_token_item.expiry_date = datetime.datetime.utcnow() + datetime.timedelta(hours=4)
            db.session.commit()

        user = User.query.filter_by(user_id=user_id).first()

        if user is None:
            return jsonify({'message': 'UserDoesNotExist'}), 401

        # except:
        #     return jsonify({'message': 'InvalidToken'}), 401

        return f(user, *args, **kwargs)

    return decorated


def is_admin(f):
    @wraps(f)
    def decorarted(user, *args, **kwargs):
        if user is None or not user.is_admin:
            return jsonify({'message': 'NotAdmin'}), 403

        return f(user, *args, **kwargs)

    return decorarted
