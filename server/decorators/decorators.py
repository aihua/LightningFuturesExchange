from functools import wraps
from flask import request, jsonify
from models.models.session_token import SessionToken
from shared.shared import db, app
import datetime
from routes.routes import trade_engine

def user_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            if 'sessiontoken' not in request.cookies and 'userid' not in request.cookies:
                return jsonify({'message': 'NoSession'}), 401

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

            user = trade_engine.users.get(user_id, None)

            if user is None:
                return jsonify({'message': 'UserDoesNotExist'}), 401

            return f(user, *args, **kwargs)
        except:
            return jsonify({'message', 'UnknownError'}), 401

    return decorated


def admin_password_required(f):
    @wraps(f)

    def decorated(*args, **kwargs):
        _request = request.get_json()

        try:
            if app.config['ADMIN_PASSWORD'] != _request.get("password", ""):
                return jsonify({'message': 'InvalidRequest'}), 500
        except:
            return jsonify({'message': 'InvalidRequest'}), 500

        return f(*args, **kwargs)

    return decorated


def is_admin(f):
    @wraps(f)
    def decorarted(user, *args, **kwargs):
        if user is None or not user.is_admin:
            return jsonify({'message': 'NotAdmin'}), 403

        return f(user, *args, **kwargs)

    return decorarted
