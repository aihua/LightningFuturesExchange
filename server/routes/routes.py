from shared.shared import app, db
from decorators.decorators import user_required
from flask import jsonify, request
from models.models.user_register import UserRegister
from models.models.user import User
from models.models.forgot_password import ForgotPassword
from models.models.change_email import ChangeEmail
from models.models.session_token import SessionToken
from emailer.emailer import send_email
from i18n.i18n import get_text
import uuid
import datetime
from validate_email import validate_email
import urllib
from sqlalchemy import or_
import re

@app.route('/api/register_user', methods=['POST'])
def register_user():
    user_register = UserRegister(request.get_json())
    if not user_register.is_valid():
        return jsonify({'message': 'InvalidUser'}), 500

    if User.query.filter_by(username=user_register.username).first() is not None:
        return jsonify({'message': 'UsernameTaken', '0': user_register.username}), 403

    if User.query.filter_by(email=user_register.email).first() is not None:
        return jsonify({'message': 'EmailTaken', '0': user_register.email}), 403

    db.session.add(user_register)
    db.session.commit()

    url = app.config['FRONT_END_ADDRESS'] + '?#/confirm_register?'

    url_params = urllib.urlencode({
        "username": user_register.username,
        "token": user_register.registration_token
    })

    url = url + url_params

    send_email(
        user_register.email,
        get_text("RegisterUser", "Subject"),
        get_text("RegisterUser", "Body").replace("{0}", user_register.username).replace("{1}", url)
    )

    return jsonify({'success': True})


@app.route('/api/confirm_user', methods=['POST'])
def confirm_user():
    form_user_register = request.get_json()

    if "username" not in form_user_register or "registrationToken" not in form_user_register:
        return jsonify({'message': 'InvalidRequest'}), 500

    actual_user_register = UserRegister.query.filter_by(
        username=form_user_register['username'],
        registration_token=form_user_register['registrationToken']
    ).first()

    if actual_user_register is None:
        return jsonify({'message': 'InvalidConfirmUserToken'}), 403

    user = User(actual_user_register)

    if User.query.filter_by(username=user.username).first() is not None:
        return jsonify({'message': 'UsernameTaken', '0': user.username}), 403

    if User.query.filter_by(email=user.email).first() is not None:
        return jsonify({'message': 'EmailTaken', '0': user.email}), 403

    db.session.delete(actual_user_register)
    db.session.add(user)
    db.session.commit()

    return jsonify({'user': user.to_dic()})


@app.route('/api/forgot_password', methods=['POST'])
def forgot_password():
    simple_user = request.get_json()

    user = User.query.filter_by(username=simple_user['username']).first()

    if user is None:
        user = User.query.filter_by(email=simple_user['username']).first()

    if user is None:
        return jsonify({'message': 'UserNotFoundForgotPassword', '0': simple_user['username']}), 403

    forgot_password = ForgotPassword(
        user_id=user.user_id,
        forgot_password_token=uuid.uuid4(),
        created_date=datetime.datetime.utcnow()
    )

    db.session.add(forgot_password)
    db.session.commit()

    url = app.config['FRONT_END_ADDRESS'] + '?#/confirm_forgot_password?'

    url_params = urllib.urlencode({
        "userid": forgot_password.user_id,
        "token": forgot_password.forgot_password_token
    })

    url = url + url_params

    send_email(
        user.email,
        get_text("ForgotPassword", "Subject"),
        get_text("ForgotPassword", "Body").replace("{0}", user.username).replace("{1}", url)
    )

    return jsonify({'success': True})


@app.route('/api/check_forgot_password', methods=['POST'])
def check_forgot_password():
    simple_forgot_password = request.get_json()

    if "userId" not in simple_forgot_password or "forgotPasswordToken" not in simple_forgot_password:
        return jsonify({'message': 'InvalidRequest'}), 500

    try:
        forgot_password = ForgotPassword.query.filter_by(
            user_id=simple_forgot_password['userId'],
            forgot_password_token=simple_forgot_password['forgotPasswordToken']
        ).first()
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if forgot_password is None:
        return jsonify({'message': 'ForgotPasswordTokenNotFound'}), 404

    user = User.query.filter_by(user_id=forgot_password.user_id).first()

    if user is None:
        return jsonify({'message': 'UserDoesNotExist'}), 404

    return jsonify({'user': user.to_dic()})


@app.route('/api/confirm_forgot_password', methods=['POST'])
def confirm_forgot_password():
    simple_forgot_password = request.get_json()

    if "userId" not in simple_forgot_password \
            or "forgotPasswordToken" not in simple_forgot_password \
            or "password" not in simple_forgot_password \
            or len(simple_forgot_password['password']) < 8:
        return jsonify({'message': 'InvalidRequest'}), 500

    try:
        forgot_password = ForgotPassword.query.filter_by(
            user_id=int(simple_forgot_password['userId']),
            forgot_password_token=simple_forgot_password['forgotPasswordToken']
        ).first()
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if forgot_password is None:
        return jsonify({'message': 'ForgotPasswordTokenNotFound'}), 404

    user = User.query.filter_by(user_id=forgot_password.user_id).first()

    if user is None:
        return jsonify({'message': 'UserDoesNotExist'}), 404

    user.set_password(simple_forgot_password['password'])
    db.session.delete(forgot_password)
    db.session.commit()

    return jsonify({'user': user.to_dic()})


@app.route('/api/login', methods=['POST'])
def login():
    simple_user = request.get_json()
    if "username" not in simple_user \
            or "password" not in simple_user:
        return jsonify({'message': 'InvalidRequest'}), 500

    user = User.query.filter_by(username=simple_user['username']).first()

    if user is None:
        user = User.query.filter_by(email=simple_user['username']).first()

    if user is None:
        return jsonify({'message': 'UserNotFoundLogin'}), 404

    if not user.check_password(simple_user['password']):
        return jsonify({'message': 'IncorrectPassword'}), 401

    session_token = SessionToken(
        user_id=user.user_id,
        session_token=uuid.uuid4(),
        ip_address=request.remote_addr,
        issued_date=datetime.datetime.utcnow(),
        expiry_date=datetime.datetime.utcnow() + datetime.timedelta(hours=4)
    )

    db.session.add(session_token)
    db.session.commit()

    return jsonify({'user': user.to_dic(), 'sessionToken': session_token.session_token})


@app.route('/api/logout', methods=['POST'])
def logout():
    # try:
    user_id = int(request.cookies.get("userid"))
    session_token = request.cookies.get("sessiontoken")

    session_token_item = SessionToken.query.filter_by(user_id=user_id, session_token=session_token).first()

    if session_token_item is None:
        return jsonify({'message': 'TokenNotFound'}), 401

    if session_token_item.expiry_date < datetime.datetime.now():
        return jsonify({'message': 'SessionExpired'}), 401

    db.session.delete(session_token_item)
    db.session.commit()

    return jsonify({'message': 'Success'})
    # except:
    #     return jsonify({'message': 'InvalidToken'}), 401


@app.route('/api/check_session', methods=['POST'])
@user_required
def check_session(user):
    return jsonify({'user': user.to_dic()})


@app.route('/api/change_email', methods=['POST'])
@user_required
def change_email(user):
    t_request = request.get_json()

    password = t_request.get('password', '')

    change_email = ChangeEmail(request.get_json())
    change_email.user_id = user.user_id

    if not change_email.is_valid():
        return jsonify({'message': 'InvalidRequest'}), 500

    if not user.check_password(password):
        return jsonify({'message': 'IncorrectPassword'}), 403

    if change_email.new_email.lower() == user.email.lower():
        return jsonify({'message': 'EmailsAreTheSame', '0': user.email}), 403

    db.session.add(change_email)
    db.session.commit()

    url = app.config['FRONT_END_ADDRESS'] + '?#/confirm_change_email?'

    url_params = urllib.urlencode({
        "userid": change_email.user_id,
        "token": change_email.change_email_token
    })

    url = url + url_params

    send_email(
        change_email.new_email,
        get_text("ChangeEmail", "Subject"),
        get_text("ChangeEmail", "Body").replace("{0}", user.username).replace("{1}", url)
    )

    return jsonify({'success': True})


@app.route('/api/check_change_email', methods=['POST'])
def check_change_email():
    simple_change_email = request.get_json()

    if "userId" not in simple_change_email \
            or "changeEmailToken" not in simple_change_email:
        return jsonify({'message': 'InvalidRequest'}), 500

    try:
        change_email = ChangeEmail.query.filter_by(
            user_id=simple_change_email['userId'],
            change_email_token=simple_change_email['changeEmailToken']
        ).first()
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if change_email is None:
        return jsonify({'message': 'ChangeEmailTokenNotFound'}), 404

    user = User.query.filter_by(user_id=change_email.user_id).first()

    if user is None:
        return jsonify({'message': 'UserDoesNotExist'}), 404

    return jsonify({'user': user.to_dic(), 'email': change_email.new_email})


@app.route('/api/confirm_change_email', methods=['POST'])
def confirm_change_email():
    simple_change_email = request.get_json()

    if "userId" not in simple_change_email \
            or "changeEmailToken" not in simple_change_email \
            or "password" not in simple_change_email:
        return jsonify({'message': 'InvalidRequest'}), 500

    try:
        change_email = ChangeEmail.query.filter_by(
            user_id=simple_change_email['userId'],
            change_email_token=simple_change_email['changeEmailToken']
        ).first()
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if change_email is None:
        return jsonify({'message': 'ChangeEmailTokenNotFound'}), 404

    user = User.query.filter_by(user_id=change_email.user_id).first()

    if user is None:
        return jsonify({'message': 'UserDoesNotExist'}), 404

    if not user.check_password(simple_change_email['password']):
        return jsonify({'message': 'IncorrectPassword'}), 403

    user.email = change_email.new_email
    db.session.delete(change_email)
    db.session.commit()

    return jsonify({'user': user.to_dic()})


@app.route('/api/change_username', methods=['POST'])
@user_required
def change_username(user):
    simple_user = request.get_json()

    try:
        password = simple_user.get('password', '')
        if len(password) < 8:
            raise 'e'
        new_username = simple_user.get('newUsername', '')
        if len(new_username) < 6:
            raise 'e'
        if not re.match('^[a-zA-Z0-9_\-]{6,}$', new_username):
            raise 'e'
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if not user.check_password(password):
        return jsonify({'message': 'IncorrectPassword'}), 403

    if new_username == user.username:
        return jsonify({'message': 'UsernamesAreTheSame', '0': new_username}), 403

    user.username = new_username
    db.session.commit()

    return jsonify({'user': user.to_dic()})


@app.route('/api/change_password', methods=['POST'])
@user_required
def change_password(user):
    simple_user = request.get_json()

    try:
        password = simple_user.get('password', '')
        if len(password) < 8:
            raise 'e'
        new_password = simple_user.get('newPassword', '')
        if len(new_password) < 8:
            raise 'e'
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if not user.check_password(password):
        return jsonify({'message': 'IncorrectPassword'}), 403

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'user': user.to_dic()})