import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import ChangePasswordStore from '../../../stores/changepasswordstore.js'
import LoginStore from '../../../stores/loginstore.js'

import * as ChangePasswordActions from  '../../../actions/changepasswordactions.js'
import * as LoginActions from  '../../../actions/loginactions.js'

import { htmlEncode } from 'js-htmlencode'

export default class ChangePasswordPage extends React.Component {
	constructor() {
		super();

		this.state = {
			validationError: '',
			validation0: '',
			changePasswordSuccess: false
		}
	}

	componentWillMount() {
		LoginStore.on('changedLoggedInState', this._forceUpdate);

		if (!LoginStore.user && LoginStore.loggedInState !== 'unknown') window.location.href = '#';

		ChangePasswordStore.on('changedChangePasswordStatus', this.changedChangePasswordStatus);
	}

	componentDidMount() {
		this.refs.form.addEventListener('submit', (event) => {
			if (this.refs.form.checkValidity() === false) {
				event.preventDefault();
				event.stopPropagation();
			} else if (this.refs.new_password.value !== this.refs.confirm_password.value) {
				this.setState({
					"validationError": "PasswordsMustMatch",
					"validation0": ''
				});
				event.preventDefault();
				event.stopPropagation();
			} else {
				ChangePasswordActions.changePassword(this.refs.new_password.value, this.refs.password.value, this.refs.twofaToken.value)
			}

			this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		LoginStore.removeListener('changedLoggedInState', this._forceUpdate);
		ChangePasswordStore.removeListener('changedChangePasswordStatus', this.changedChangePasswordStatus);
	}

	changedChangePasswordStatus = () => {
		if (ChangePasswordStore.changePasswordStatus === 'error') {
			this.setState({
				"validationError": ChangePasswordStore.changePasswordError.message || 'UnknownError',
				"validation0": ChangePasswordStore.changePasswordError['0']
			});
		} else {
			if (ChangePasswordStore.changePasswordStatus === 'fetching') {
				this.setState({
					validationError: '',
					validation0: ''
				})
			} else {
				if (ChangePasswordStore.changePasswordStatus === 'fetched') {
					this.setState({
						validationError: '',
						changePasswordSuccess: true
					});
				}
			}
		}
	}

	_forceUpdate = () => {
		this.forceUpdate();
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		const allDisabled = ChangePasswordStore.changePasswordStatus === 'fetching';

		if (this.state.changePasswordSuccess) {
			const change_password_success = t.Generic.ChangePasswordSuccess.replace('{0}', htmlEncode(LoginStore.user.username));

			return (
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-12">
							<div class="card card-form">
								<div class="card-header">
									<h2>{t.Generic.ChangePassword}</h2>
								</div>
								<div class="card-body">
									<p class="mb-3" dangerouslySetInnerHTML={{__html: change_password_success }} />
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		} else {
			const validationError = (t.Error[this.state.validationError] || '').replace('{0}', htmlEncode(this.state.validation0 || '')) || t.Error.UnknownError;

			return (
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-12">
							<form class="needs-validation" noValidate={true} ref="form">
								<div class="card card-form">
									<div class="card-header">
										<h2>{t.Generic.ChangePassword}</h2>
									</div>
									<div class="card-body">
										<div class="form-group row">
											<label for="change_password_username"><b>{t.Generic.Username + ':'}</b></label>
											<label id="change_password_username">{(LoginStore.user || {}).username || ''}</label>
										</div>
										<div class="form-group row">
											<label for="change_password_email"><b>{t.Generic.Email + ':'}</b></label>
											<label id="change_password_email">{(LoginStore.user || {}).email || ''}</label>
										</div>
										<div class="form-group row">
											<label for="change_password_password"><b>{t.Generic.Password + ':'}</b></label>
											<input ref="password" type="password" class="form-control" id="change_password_password" required={true} pattern=".{8,}" disabled={allDisabled} />
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterPassword}
											</div>
										</div>
										<div class="form-group row">
											<label for="change_password_new_password"><b>{t.Generic.NewPassword + ':'}</b></label>
											<input ref="new_password" type="password" class="form-control" id="change_password_new_password" required={true} pattern=".{8,}" disabled={allDisabled} />
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterNewPassword}
											</div>
										</div>
										<div class="form-group row">
											<label for="change_password_confirm_password"><b>{t.Generic.ConfirmNewPassword + ':'}</b></label>
											<input ref="confirm_password" type="password" class="form-control" id="change_password_confirm_password" required={true} pattern=".{8,}" disabled={allDisabled} />
											<div class="invalid-feedback">
												{t.Validation.PleaseReEnterNewPassword}
											</div>
										</div>
										<div class="form-group row">
											<label for="change_password_2fa"><b>{t.Generic.TwoFactorToken + ':'}</b></label>
											<input ref="twofaToken" type="text" class="form-control" id="change_password_2fa" pattern="[0-9]{6,6}" disabled={allDisabled} />
											<div class="invalid-feedback">
												{t.Validation.PleaseEnter2FA}
											</div>
										</div>
										<div class="form-group row" style={{display: !!this.state.validationError ? 'flex' : 'none' }}>
											<div class="alert alert-danger" style={{width: '100%'}} dangerouslySetInnerHTML={{__html: validationError}} />
										</div>
									</div>
									<div class="card-footer">
										<div class="small-vert-padding pull-right">
											<button type="submit" class="btn btn-primary btn-lg" disabled={allDisabled} >{t.Generic.Submit}</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			)
		}
	}
}