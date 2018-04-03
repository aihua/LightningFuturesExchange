import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import ChangeEmailStore from '../../../stores/changeemailstore.js'
import LoginStore from '../../../stores/loginstore.js'

import * as ChangeEmailActions from  '../../../actions/changeemailactions.js'
import * as LoginActions from  '../../../actions/loginactions.js'

import { htmlEncode } from 'js-htmlencode'

export default class ChangeEmailPage extends React.Component {
	constructor() {
		super();

		this.state = {
			validationError: '',
			validation0: '',
			changeEmailSuccess: false,
			oldEmail: (LoginStore.user || {}).email,
			newEmail: ''
		}
	}

	componentWillMount() {
		LoginStore.on('changedLoggedInState', this._forceUpdate);

		if (!LoginStore.user && LoginStore.loggedInState !== 'unknown') window.location.href = '#';

		ChangeEmailStore.on('changedChangeEmailStatus', this.changedChangeEmailStatus);
	}

	componentDidMount() {
		this.refs.form.addEventListener('submit', (event) => {
			if (this.refs.form.checkValidity() === false) {
			} else {
				ChangeEmailActions.changeEmail(this.refs.newEmail.value, this.refs.password.value, this.refs.twofaToken.value)
			}

			event.preventDefault();
			event.stopPropagation();
			this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		LoginStore.removeListener('changedLoggedInState', this._forceUpdate);
		ChangeEmailStore.removeListener('changedChangeEmailStatus', this.changedChangeEmailStatus);
	}

	changedChangeEmailStatus = () => {
		if (ChangeEmailStore.changeEmailStatus === 'error') {
			this.setState({
				"validationError": ChangeEmailStore.changeEmailError.message || 'UnknownError',
				"validation0": ChangeEmailStore.changeEmailError['0']
			});
		} else {
			if (ChangeEmailStore.changeEmailStatus === 'fetching') {
				this.setState({
					validationError: '',
					validation0: '',
					newEmail: this.refs.newEmail.value
				})
			} else {
				if (ChangeEmailStore.changeEmailStatus === 'fetched') {
					this.setState({
						validationError: '',
						changeEmailSuccess: true
					});
				}
			}
		}
	}

	_forceUpdate = () => {
		this.setState({
			oldEmail: (LoginStore.user || {}).email
		})
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		const allDisabled = ChangeEmailStore.changeEmailStatus === 'fetching';

		if (this.state.changeEmailSuccess) {
			const change_email_success = t.Generic.ChangeEmailSuccess.replace('{0}', htmlEncode(this.state.oldEmail)).replace('{1}', htmlEncode(this.state.newEmail));

			return (
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-12">
							<div class="card card-form">
								<div class="card-header">
									<h2>{t.Generic.ChangeEmail}</h2>
								</div>
								<div class="card-body">
									<p class="mb-3" dangerouslySetInnerHTML={{__html: change_email_success }} />
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
										<h2>{t.Generic.ChangeEmail}</h2>
									</div>
									<div class="card-body">
										<div class="form-group row">
											<label for="change_email_username"><b>{t.Generic.Username + ':'}</b></label>
											<label id="change_email_username">{(LoginStore.user || {}).username || ''}</label>
										</div>
										<div class="form-group row">
											<label for="change_email_old_email"><b>{t.Generic.Email + ':'}</b></label>
											<label id="change_email_old_email">{(LoginStore.user || {}).email || ''}</label>
										</div>
										<div class="form-group row">
											<label for="change_email_new_email"><b>{t.Generic.NewEmail + ':'}</b></label>
											<input ref="newEmail" type="email" class="form-control" id="change_email_new_email" required={true} disabled={allDisabled}/>
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterNewEmail}
											</div>
										</div>
										<div class="form-group row">
											<label for="change_email_password"><b>{t.Generic.Password + ':'}</b></label>
											<input ref="password" type="password" class="form-control" id="change_email_password" required={true} pattern=".{8,}" disabled={allDisabled} />
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterPassword}
											</div>
										</div>
										<div class="form-group row">
											<label for="change_email_2fa"><b>{t.Generic.TwoFactorToken + ':'}</b></label>
											<input ref="twofaToken" type="text" class="form-control" id="change_email_2fa" pattern="[0-9]{6,6}" disabled={allDisabled} autoComplete="off"/>
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