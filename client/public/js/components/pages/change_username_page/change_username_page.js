import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import ChangeUsernameStore from '../../../stores/changeusernamestore.js'
import LoginStore from '../../../stores/loginstore.js'

import * as ChangeUsernameActions from  '../../../actions/changeusernameactions.js'
import * as LoginActions from  '../../../actions/loginactions.js'

import { htmlEncode } from 'js-htmlencode'

export default class ChangeUsernamePage extends React.Component {
	constructor() {
		super();

		this.state = {
			validationError: '',
			validation0: '',
			changeUsernameSuccess: false,
			oldUsername: (LoginStore.user || {}).username,
			newUsername: ''
		}
	}

	componentWillMount() {
		LoginStore.on('changedLoggedInState', this._forceUpdate);

		if (!LoginStore.user && LoginStore.loggedInState !== 'unknown') window.location.href = '#';

		ChangeUsernameStore.on('changedChangeUsernameStatus', this.changedChangeUsernameStatus);
	}

	componentDidMount() {
		this.refs.form.addEventListener('submit', (event) => {
			if (this.refs.form.checkValidity() === false) {
				event.preventDefault();
				event.stopPropagation();
			} else {
				ChangeUsernameActions.changeUsername(this.refs.newUsername.value, this.refs.password.value, this.refs.twofaToken.value)
			}

			this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		LoginStore.removeListener('changedLoggedInState', this._forceUpdate);
		ChangeUsernameStore.removeListener('changedChangeUsernameStatus', this.changedChangeUsernameStatus);
	}

	changedChangeUsernameStatus = () => {
		if (ChangeUsernameStore.changeUsernameStatus === 'error') {
			this.setState({
				"validationError": ChangeUsernameStore.changeUsernameError.message || 'UnknownError',
				"validation0": ChangeUsernameStore.changeUsernameError['0']
			});
		} else {
			if (ChangeUsernameStore.changeUsernameStatus === 'fetching') {
				this.setState({
					validationError: '',
					validation0: '',
					newUsername: this.refs.newUsername.value
				})
			} else {
				if (ChangeUsernameStore.changeUsernameStatus === 'fetched') {
					this.setState({
						validationError: '',
						changeUsernameSuccess: true
					});
				}
			}
		}
	}

	_forceUpdate = () => {
		this.setState({
			oldUsername: (LoginStore.user || {}).username
		})
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		const allDisabled = ChangeUsernameStore.changeUsernameStatus === 'fetching';

		if (this.state.changeUsernameSuccess) {
			const change_username_success = t.Generic.ChangeUsernameSuccess.replace('{0}', htmlEncode(this.state.oldUsername)).replace('{1}', htmlEncode(this.state.newUsername));

			return (
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-12">
							<div class="card card-form">
								<div class="card-header">
									<h2>{t.Generic.ChangeUsername}</h2>
								</div>
								<div class="card-body">
									<p class="mb-3" dangerouslySetInnerHTML={{__html: change_username_success }} />
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
										<h2>{t.Generic.ChangeUsername}</h2>
									</div>
									<div class="card-body">
										<div class="form-group row">
											<label for="change_username_username"><b>{t.Generic.Username + ':'}</b></label>
											<label id="change_username_username">{(LoginStore.user || {}).username || ''}</label>
										</div>
										<div class="form-group row">
											<label for="change_username_email"><b>{t.Generic.Email + ':'}</b></label>
											<label id="change_username_email">{(LoginStore.user || {}).email || ''}</label>
										</div>
										<div class="form-group row">
											<label for="change_username_new_username"><b>{t.Generic.NewUsername + ':'}</b></label>
											<input ref="newUsername" type="text" class="form-control" id="change_username_new_username" required={true} disabled={allDisabled} pattern="[a-zA-Z0-9_\-]{6,}" />
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterNewUsername}
											</div>
										</div>
										<div class="form-group row">
											<label for="change_username_password"><b>{t.Generic.Password + ':'}</b></label>
											<input ref="password" type="password" class="form-control" id="change_username_password" required={true} pattern=".{8,}" disabled={allDisabled} />
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterPassword}
											</div>
										</div>
										<div class="form-group row">
											<label for="change_username_2fa"><b>{t.Generic.TwoFactorToken + ':'}</b></label>
											<input ref="twofaToken" type="text" class="form-control" id="change_username_2fa" pattern="[0-9]{6,6}" disabled={allDisabled} autoComplete="off"/>
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