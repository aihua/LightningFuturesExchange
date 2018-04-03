from trade_engine.trade_engine import trade_engine
from shared.shared import app, db
from decorators.decorators import user_required, admin_password_required
from flask import jsonify, request
from models.models.user_register import UserRegister
from models.models.user import User
from models.models.forgot_password import ForgotPassword
from models.models.change_email import ChangeEmail
from models.models.session_token import SessionToken
from models.models.current_address_count import create_new_deposit_address
from models.models.deposit_address import DepositAddress
from models.models.deposit_id import DepositId
from models.models.deposit import Deposit
from models.models.withdrawal import Withdrawal
from models.models.withdrawal_id import WithdrawalId

from models.models.order import Order, OrderType
from models.models.order_id import OrderId

from models.models.equity import Equity
from emailer.emailer import send_email
from i18n.i18n import get_text
from bitcoin.bitcoin import check_bc
import uuid
import datetime
import urllib
import re
import pyotp


@app.route('/api/register_user', methods=['POST'])
def register_user():
    user_register = UserRegister(request.get_json())

    if not user_register.is_valid():
        return jsonify({'message': 'InvalidUser'}), 500

    user_register.set_password(user_register.password)

    if trade_engine.usernames.get(user_register.username, None) is not None:
        return jsonify({'message': 'UsernameTaken', '0': user_register.username}), 403

    if trade_engine.usernames.get(user_register.email, None) is not None:
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

    with trade_engine.reader_writer_lock_dic.write_enter('un' + user.username):
        with trade_engine.reader_writer_lock_dic.write_enter('ue' + user.email):
            if trade_engine.usernames.get(user.username, None):
                return jsonify({'message': 'UsernameTaken', '0': user.username}), 403

            if trade_engine.user_emails.get(user.email, None):
                return jsonify({'message': 'EmailTaken', '0': user.email}), 403

            db.session.delete(actual_user_register)
            db.session.add(user)
            db.session.flush()

            create_new_deposit_address(user)

            db.session.commit()

            trade_engine.users[user.user_id] = user
            trade_engine.usernames[user.username] = user
            trade_engine.user_emails[user.email] = user

    return jsonify({'user': user.to_dic()})


@app.route('/api/forgot_password', methods=['POST'])
def forgot_password():
    simple_user = request.get_json()

    simple_username = simple_user.get("username", "").strip().lower()

    user = trade_engine.usernames.get(simple_username, None)

    if user is None:
        user = trade_engine.user_emails.get(simple_username, None)

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
            user_id=simple_forgot_password.get('userId', ""),
            forgot_password_token=simple_forgot_password.get('forgotPasswordToken', "")
        ).first()
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if forgot_password is None:
        return jsonify({'message': 'ForgotPasswordTokenNotFound'}), 404

    user = trade_engine.users.get(simple_forgot_password.get('userId', ""), None)

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

    user_id = simple_forgot_password.get('userId', "")

    try:
        forgot_password = ForgotPassword.query.filter_by(
            user_id=user_id,
            forgot_password_token=simple_forgot_password.get('forgotPasswordToken', "")
        ).first()
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if forgot_password is None:
        return jsonify({'message': 'ForgotPasswordTokenNotFound'}), 404

    with trade_engine.reader_writer_lock_dic.write_enter("uu" + str(user_id)):
        try:
            user = trade_engine.users.get(user_id, None)

            if user is None:
                return jsonify({'message': 'UserDoesNotExist'}), 404

            user.set_password(simple_forgot_password['password'])
            user.two_f_a_enabled = False
            user.two_f_a_token = ''
            db.session.delete(forgot_password)
            db.session.commit()

            return jsonify({'user': user.to_dic()})
        except:
            return jsonify({'message': "UnknownError"})


@app.route('/api/login', methods=['POST'])
def login():
    simple_user = request.get_json()
    if "username" not in simple_user \
            or "password" not in simple_user \
            or "token" not in simple_user:
        return jsonify({'message': 'InvalidRequest'}), 500

    username = simple_user.get('username', "").strip().lower()

    try:
        user = trade_engine.usernames.get(username, None)

        if user is None:
            user = trade_engine.user_emails.get(username, None)

        if user is None:
            return jsonify({'message': 'UserNotFoundLogin'}), 404

        if not user.check_password(simple_user.get('password', '')):
            return jsonify({'message': 'IncorrectPassword'}), 401

        if not user.check_token(simple_user.get('token', '')):
            return jsonify({'message': 'IncorrectToken'}), 401

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
    except:
        return jsonify({'message': 'UnknownError'}), 500


@app.route('/api/logout', methods=['POST'])
def logout():
    try:
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
    except:
        return jsonify({'message': 'UnknownError'}), 401


@app.route('/api/check_session', methods=['POST'])
@user_required
def check_session(user):
    return jsonify({'user': user.to_dic()})


@app.route('/api/change_email', methods=['POST'])
@user_required
def change_email(user):
    t_request = request.get_json()

    change_email = ChangeEmail(request.get_json())
    change_email.user_id = user.user_id

    if not change_email.is_valid():
        return jsonify({'message': 'InvalidRequest'}), 500

    if not user.check_password(t_request.get('password', '')):
        return jsonify({'message': 'IncorrectPassword'}), 403

    if not user.check_token(t_request.get('token', '')):
        return jsonify({'message': 'IncorrectToken'}), 403

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

    user_id = simple_change_email.get('userId', '')

    try:
        change_email = ChangeEmail.query.filter_by(
            user_id=user_id,
            change_email_token=simple_change_email['changeEmailToken']
        ).first()
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if change_email is None:
        return jsonify({'message': 'ChangeEmailTokenNotFound'}), 404

    user = trade_engine.users.get(user_id, None)

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

    user_id = simple_change_email.get('userId', '')

    try:
        change_email = ChangeEmail.query.filter_by(
            user_id=user_id,
            change_email_token=simple_change_email['changeEmailToken']
        ).first()
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if change_email is None:
        return jsonify({'message': 'ChangeEmailTokenNotFound'}), 404

    user = trade_engine.users.get(user_id, None)

    if user is None:
        return jsonify({'message': 'UserDoesNotExist'}), 404

    if not user.check_password(simple_change_email.get('password', '')):
        return jsonify({'message': 'IncorrectPassword'}), 403

    if not user.check_token(simple_change_email.get('token', '')):
        return jsonify({'message': 'IncorrectToken'}), 403

    try:
        with trade_engine.reader_writer_lock_dic.write_enter("uu" + str(user.user_id)):
            emails = [user.email, change_email.new_email]
            emails.sort()

            with trade_engine.reader_writer_lock_dic.write_enter("ue" + str(emails[0])):
                with trade_engine.reader_writer_lock_dic.write_enter("ue" + str(emails[1])):
                    old_email = user.email
                    user.email = change_email.new_email

                    db.session.delete(change_email)
                    db.session.commit()

                    del trade_engine.user_emails[old_email]
                    trade_engine.user_emails[change_email.new_email] = user

        return jsonify({'user': user.to_dic()})
    except:
        return jsonify({'message': 'UnknownError'}), 500


@app.route('/api/change_username', methods=['POST'])
@user_required
def change_username(user):
    simple_user = request.get_json()

    try:
        password = simple_user.get('password', '')
        if len(password) < 8:
            raise Exception('e')
        new_username = simple_user.get('newUsername', '').strip().lower()
        if len(new_username) < 6:
            raise Exception('e')
        if not re.match('^[a-zA-Z0-9_\-]{6,}$', new_username):
            raise Exception('e')
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if not user.check_password(password):
        return jsonify({'message': 'IncorrectPassword'}), 403

    if not user.check_token(simple_user.get('token', '')):
        return jsonify({'message': 'IncorrectToken'}), 403

    if new_username == user.username:
        return jsonify({'message': 'UsernamesAreTheSame', '0': new_username}), 403

    try:
        with trade_engine.reader_writer_lock_dic.write_enter('uu' + str(user.user_id)):
            usernames = [user.username, new_username]
            usernames.sort()

            with trade_engine.reader_writer_lock_dic.write_enter('un' + usernames[0]):
                with trade_engine.reader_writer_lock_dic.write_enter('un' + usernames[1]):

                    old_username = user.username

                    user.username = new_username
                    db.session.commit()

                    del trade_engine.user_emails[old_username]
                    trade_engine.user_emails[new_username] = user

                    return jsonify({'user': user.to_dic()})
    except:
        return jsonify({'message': 'UnknownError'}), 500


@app.route('/api/change_password', methods=['POST'])
@user_required
def change_password(user):
    simple_user = request.get_json()

    try:
        password = simple_user.get('password', '')
        if len(password) < 8:
            raise Exception('e')
        new_password = simple_user.get('newPassword', '')
        if len(new_password) < 8:
            raise Exception('e')
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if not user.check_password(password):
        return jsonify({'message': 'IncorrectPassword'}), 403

    if not user.check_token(simple_user.get('token', '')):
        return jsonify({'message': 'IncorrectToken'}), 403

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'user': user.to_dic()})


@app.route('/api/get_two_factor_token', methods=['POST'])
@user_required
def get_two_factor_token(user):

    if user.two_f_a_enabled:
        return jsonify({'message': '2FAAlreadyEnabled'}), 403

    user.two_f_a_token = pyotp.random_base32()
    user.two_f_a_enabled = False
    db.session.commit()

    return jsonify({'otpauth': pyotp.totp.TOTP(user.two_f_a_token).provisioning_uri(user.email, issuer_name="Lightning Futures Exchange")})


@app.route('/api/enable_two_factor_authentication', methods=['POST'])
@user_required
def enable_two_factor_authentication(user):
    token = request.get_json()

    try:
        if len(token['token']) < 6:
            raise Exception('e')
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if user.two_f_a_token == '':
        return jsonify({'message': 'NoGetTwoFactorTokenRequestMade'}), 403

    if user.two_f_a_enabled:
        return jsonify({'message': '2FAAlreadyEnabled'}), 403

    totp = pyotp.TOTP(user.two_f_a_token)
    is_valid = totp.verify(token['token'])

    if is_valid:
        user.two_f_a_enabled = True
        db.session.commit()
        return jsonify({'user': user.to_dic()})
    else:
        return jsonify({'message': 'IncorrectToken'}), 403


@app.route('/api/disable_two_factor_authentication', methods=['POST'])
@user_required
def disable_two_factor_authentication(user):
    token = request.get_json()

    try:
        if len(token['token']) < 6:
            raise Exception('e')
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    if not user.two_f_a_enabled and user.two_f_a_token == '':
        return jsonify({'message': '2FAAlreadyDisabled'}), 403

    is_valid = True

    if not user.two_f_a_token == '':
        totp = pyotp.TOTP(user.two_f_a_token)
        is_valid = totp.verify(token['token'])

    if is_valid:
        user.two_f_a_token = ''
        user.two_f_a_enabled = False
        db.session.commit()
        return jsonify({'user': user.to_dic()})
    else:
        return jsonify({'message': 'IncorrectToken'}), 403


def get_deposits_helper(user):
    deposit_addresses = DepositAddress.query.filter_by(
        user_id=user.user_id
    ).order_by(DepositAddress.address_id.desc()).all()

    deposits = Deposit.query.filter_by(user_id=user.user_id).all()

    deposit_addresses_json = []
    for deposit_address in deposit_addresses:
        deposit_addresses_json.append(deposit_address.to_dic())

    deposits_json = []
    for deposit in deposits:
        deposits_json.append(deposit.to_dic())

    return jsonify({'depositAddresses': deposit_addresses_json, 'deposits': deposits_json})


@app.route('/api/get_deposits', methods=['GET'])
@user_required
def get_deposits(user):
    return get_deposits_helper(user)


@app.route('/api/create_deposit_address', methods=['POST'])
@user_required
def create_deposit_address(user):
    create_new_deposit_address(user)
    db.session.commit()
    return get_deposits_helper(user)


@app.route('/api/add_deposit', methods=['POST'])
@admin_password_required
def add_deposit():
    deposit_request = request.get_json()

    try:
        quantity = int(deposit_request.get("quantity", ""))
    except:
        return jsonify({'message': 'InvalidQuantity'}), 500

    user_id = int(deposit_request.get("userId", -1))

    with trade_engine.reader_writer_lock_dic.write_enter("uu" + str(user_id)):
        try:
            user = trade_engine.users.get(user_id, None)

            if user is None:
                return jsonify({'message': 'UserNotFound'}), 404

            deposit_id = DepositId.query.filter_by(
                user_id=deposit_request.get("userId", ""),
                address_id=deposit_request.get("addressId", "")
            ).first()

            if deposit_id is None:
                deposit_id = DepositId(
                    user_id=user_id,
                    address_id=deposit_request.get("addressId", ""),
                    deposit_id=0
                )
                db.session.add(deposit_id)
            else:
                deposit_id.deposit_id += 1

            deposit = Deposit(
                user_id=user_id,
                address_id=deposit_request.get("addressId", ""),
                deposit_id=deposit_id.deposit_id,
                transaction_id=deposit_request.get("transactionId", ""),
                quantity=quantity,
                created_date=datetime.datetime.utcnow()
            )

            try:
                user.balance += quantity

                db.session.add(deposit)
                db.session.commit()
            except:
                user.balance -= quantity
                return jsonify({'message', 'UnknownError'}), 500
        except:
            return jsonify({'message', 'UnknownError'}), 500

    return jsonify({'deposit': deposit.to_dic()})


@app.route('/api/get_withdrawals', methods=['GET'])
@user_required
def get_withdrawals(user):
    withdrawals = Withdrawal.query.filter_by(user_id=user.user_id).order_by(Withdrawal.withdrawal_id.desc()).all()

    withdrawals_json = []
    for withdrawal in withdrawals:
        withdrawals_json.append(withdrawal.to_dic())

    return jsonify({"withdrawals": withdrawals_json})


@app.route('/api/request_withdrawal', methods=['POST'])
@user_required
def request_withdrawal(user):
    withdrawal_request = request.get_json()

    if not check_bc(withdrawal_request.get('address', '')):
        return jsonify({'message': 'InvalidBitcoinAddress'}), 500

    try:
        amount = int(withdrawal_request.get('amount', ''))
    except:
        return jsonify({'message': 'InvalidAmountEntered'}), 500

    if amount < 100:
        return jsonify({'message': 'InvalidAmountEntered'}), 500

    with trade_engine.reader_writer_lock_dic.write_enter("uu" + str(user.user_id)):
        try:
            if amount > user.balance:
                return jsonify({'message': 'WithdrawalAmountTooHigh'}), 500

            withdrawal_id = WithdrawalId.query.filter_by(user_id=user.user_id).first()

            if withdrawal_id is None:
                withdrawal_id = WithdrawalId(
                    user_id=user.user_id,
                    withdrawal_id=0
                )
                db.session.add(withdrawal_id)
            else:
                withdrawal_id.withdrawal_id += 1

            new_withdrawal = Withdrawal(
                user_id=user.user_id,
                withdrawal_id=withdrawal_id.withdrawal_id,
                address=withdrawal_request.get('address', ''),
                amount=amount,
                withdrawal_token=uuid.uuid4(),
                cancelled=False,
                transaction_id='',
                created_date=datetime.datetime.utcnow(),
                confirmed_date=None,
                sent_date=None
            )

            try:
                user.balance -= amount

                db.session.add(new_withdrawal)
                db.session.commit()

                trade_engine.users[user.user_id] = user
            except:
                user.balance += amount
                return jsonify({'message', 'UnknownError'}), 500
        except:
            return jsonify({'message', 'UnknownError'}), 500

    url_params = urllib.urlencode({
        "userid": user.user_id,
        "withdrawalid": new_withdrawal.withdrawal_id,
        "withdrawaltoken": new_withdrawal.withdrawal_token
    })

    url_confirm = app.config['FRONT_END_ADDRESS'] + '?#/confirm_withdrawal?'
    url_cancel = app.config['FRONT_END_ADDRESS'] + '?#/cancel_withdrawal?'

    url_confirm = url_confirm + url_params
    url_cancel = url_cancel + url_params

    send_email(
        user.email,
        get_text("WithdrawalRequest", "Subject"),
        get_text("WithdrawalRequest", "Body")
            .replace("{0}", user.username)
            .replace("{1}", str(new_withdrawal.amount / 10000000000.0))
            .replace("{2}", new_withdrawal.address)
            .replace("{3}", url_confirm)
            .replace("{4}", url_cancel)
    )

    withdrawals = Withdrawal.query.filter_by(user_id=user.user_id).order_by(Withdrawal.withdrawal_id.desc()).all()

    withdrawals_json = []
    for withdrawal in withdrawals:
        withdrawals_json.append(withdrawal.to_dic())

    return jsonify({"user": user.to_dic(), "withdrawals": withdrawals_json, "withdrawal": new_withdrawal.to_dic()})


@app.route('/api/resend_withdrawal_request', methods=['POST'])
@user_required
def resend_withdrawal_request(user):
    withdrawal_request = request.get_json()

    withdrawal = Withdrawal.query.filter_by(
        user_id=user.user_id,
        withdrawal_id=withdrawal_request.get("withdrawalId", "")
    ).first()

    if withdrawal is None or withdrawal.confirmed_date is not None:
        return jsonify({'message': 'WithdrawalRequestNotFound'}), 404

    url_params = urllib.urlencode({
        "userid": user.user_id,
        "withdrawalid": withdrawal.withdrawal_id,
        "withdrawaltoken": withdrawal.withdrawal_token
    })

    url_confirm = app.config['FRONT_END_ADDRESS'] + '?#/confirm_withdrawal?'
    url_cancel = app.config['FRONT_END_ADDRESS'] + '?#/cancel_withdrawal?'

    url_confirm = url_confirm + url_params
    url_cancel = url_cancel + url_params

    send_email(
        user.email,
        get_text("WithdrawalRequest", "Subject"),
        get_text("WithdrawalRequest", "Body")
            .replace("{0}", user.username)
            .replace("{1}", str(withdrawal.amount / 10000000000.0))
            .replace("{2}", withdrawal.address)
            .replace("{3}", url_confirm)
            .replace("{4}", url_cancel)
    )

    return jsonify({"withdrawal": withdrawal.to_dic()})


@app.route('/api/get_withdrawal_request', methods=['GET'])
def get_withdrawal():
    user_id = int(request.args.get("userId", -1))

    withdrawal = Withdrawal.query.filter_by(
        user_id=user_id,
        withdrawal_id=request.args.get("withdrawalId", ""),
        withdrawal_token=request.args.get("withdrawalToken", "")
    ).first()

    if withdrawal is None or withdrawal.confirmed_date is not None:
        return jsonify({'message': 'WithdrawalRequestNotFound'}), 404

    user = trade_engine.users.get(user_id, None)

    if user is None:
        return jsonify({'message': 'UserDoesNotExist'}), 404

    return jsonify({"user": user.to_dic(), "withdrawal": withdrawal.to_dic()})


@app.route('/api/confirm_withdrawal', methods=['POST'])
def confirm_withdrawal():
    confirm_request = request.get_json()

    user_id = int(confirm_request.get("userId", -1))

    withdrawal = Withdrawal.query.filter_by(
        user_id=user_id,
        withdrawal_id=confirm_request.get("withdrawalId", ""),
        withdrawal_token=confirm_request.get("withdrawalToken", "")
    ).first()

    if withdrawal is None or withdrawal.confirmed_date is not None:
        return jsonify({'message': 'WithdrawalRequestNotFound'}), 404

    user = trade_engine.users.get(user_id, None)

    if user is None:
        return jsonify({'message': 'UserDoesNotExist'}), 404

    if not user.check_password(confirm_request.get("password", "")):
        return jsonify({'message': 'IncorrectPassword'}), 403

    if not user.check_token(confirm_request.get("twoFactorToken", "")):
        return jsonify({'message': 'IncorrectToken'}), 403

    withdrawal.confirmed_date = datetime.datetime.utcnow()
    db.session.commit()

    return jsonify({"user": user.to_dic(), "withdrawal": withdrawal.to_dic()})


@app.route('/api/cancel_withdrawal', methods=['POST'])
def cancel_withdrawal():
    confirm_request = request.get_json()

    user_id = int(confirm_request.get("userId", -1))

    withdrawal = Withdrawal.query.filter_by(
        user_id=user_id,
        withdrawal_id=confirm_request.get("withdrawalId", ""),
        withdrawal_token=confirm_request.get("withdrawalToken", "")
    ).first()

    if withdrawal is None or withdrawal.confirmed_date is not None:
        return jsonify({'message': 'WithdrawalRequestNotFound'}), 404

    if user_id == -1:
        return jsonify({'message': 'UserDoesNotExist'}), 404

    with trade_engine.reader_writer_lock_dic.write_enter("uu" + str(user_id)):
        try:
            user = trade_engine.users.get(user_id, None)

            if user is None:
                return jsonify({'message': 'UserDoesNotExist'}), 404

            if not user.check_password(confirm_request.get("password", "")):
                return jsonify({'message': 'IncorrectPassword'}), 403

            if not user.check_token(confirm_request.get("twoFactorToken", "")):
                return jsonify({'message': 'IncorrectToken'}), 403

            user.balance += withdrawal.amount

            try:
                withdrawal.confirmed_date = datetime.datetime.utcnow()
                withdrawal.cancelled = True
                db.session.commit()
            except:
                user.balance -= withdrawal.amount
                return jsonify({'message', 'UnknownError'}), 500
        except:
            return jsonify({'message', 'UnknownError'}), 500


    return jsonify({"user": user.to_dic(), "withdrawal": withdrawal.to_dic()})


@app.route('/api/add_withdrawal', methods=['POST'])
@admin_password_required
def add_withdrawal():
    withdrawal_request = request.get_json()

    withdrawal = Withdrawal.query.filter_by(
        user_id=withdrawal_request.get("userId", ""),
        withdrawal_id=withdrawal_request.get("withdrawalId", "")
    ).first()

    if withdrawal is None or withdrawal.confirmed_date is None:
        return jsonify({'message': 'WithdrawalRequestNotFound'}), 404

    withdrawal.transactionId = withdrawal_request.get("transactionId", ""),
    withdrawal.sent_date = datetime.datetime.utcnow()
    db.session.commit()

    return jsonify({"withdrawal": withdrawal.to_dic()})


@app.route('/api/add_equity', methods=['POST'])
@admin_password_required
def add_equity():
    _request = request.get_json()

    if app.config['ADMIN_PASSWORD'] != _request.get("password", ""):
        return jsonify({'message': 'InvalidRequest'}), 500

    equity = Equity(_request)
    db.session.add(equity)
    db.session.commit()

    return jsonify({"equity": equity.to_dic()})


@app.route('/api/get_equities', methods=['GET'])
def get_equities():
    equities = Equity.query.order_by(Equity.equity_id).all()

    equities_json = []
    for equity in equities:
        equities_json.append(equity.to_dic())

    return jsonify({"equities": equities_json})


@app.route('/api/place_order', methods=['POST'])
@user_required
def place_order(user):
    _request = request.get_json()

    try:
        order = Order(_request)
        if not order.is_valid():
            return jsonify({'message': 'InvalidRequest'}), 500
    except:
        return jsonify({'message': 'InvalidRequest'}), 500

    with trade_engine.reader_writer_lock_dic.write_enter('e' + str(order.equity_id)):
        try:

            equity = trade_engine.equities.get(order.equity_id, None)

            if equity is None:
                return jsonify({"message": "EquityNotFound"}), 404

            if order.order_type == OrderType.MARKET:
                return
            elif order.order_type == OrderType.LIMIT:
                return
            elif order.order_type == OrderType.TRIGGER:
                return
            elif order.order_type == OrderType.RANGE:
                return
        except:
            return

    return jsonify({"equity": equity.to_dic()})


