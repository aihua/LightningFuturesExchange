import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import RegisterUserStore from '../../../stores/registeruserstore.js'
import * as RegisterUserActions from  '../../../actions/registeruseractions.js'
import * as LoginActions from  '../../../actions/loginactions.js'

import { htmlEncode } from 'js-htmlencode'

export default class RegisterPage extends React.Component {
	constructor() {
		super();

		this.state = {
			validationError: '',
			validation0: '',
			registerSuccess: false,
			username: '',
			email: ''
		}
	}

	componentWillMount() {
		LoginActions.changeLoggedInState('loggedout');

		RegisterUserStore.on('changedRegisterUserStatus', this.changeRegisterUserStatus);
	}

	componentDidMount() {
		this.refs.form.addEventListener('submit', (event) => {
			if (this.refs.form.checkValidity() === false) {
				event.preventDefault();
				event.stopPropagation();
			} else if (this.refs.password.value !== this.refs.confirm_password.value) {
				this.setState({
					"validationError": "PasswordsMustMatch",
					"validation0": ''
				});
				event.preventDefault();
				event.stopPropagation();
			} else {
				RegisterUserActions.registerUser({
					username: this.refs.username.value,
					email: this.refs.email.value,
					password: this.refs.password.value,
				})
			}

			this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		RegisterUserStore.removeListener('changedRegisterUserStatus', this.changeRegisterUserStatus);
	}

	changeRegisterUserStatus = () => {
		if (RegisterUserStore.registerUserStatus === 'error') {
			this.setState({
				"validationError": RegisterUserStore.registerUserError.message || 'UnknownError',
				"validation0": RegisterUserStore.registerUserError['0']
			});
		} else {
			if (RegisterUserStore.registerUserStatus === 'fetching') {
				this.setState({
					validationError: '',
					username: this.refs.username.value,
					email: this.refs.email.value
				})
			} else {
				if (RegisterUserStore.registerUserStatus === 'fetched') {
					this.setState({
						validationError: '',
						registerSuccess: true
					});
				}
			}
		}
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		const allDisabled = RegisterUserStore.registerUserStatus === 'fetching';

		if (this.state.registerSuccess) {
			const resgister_success = t.Generic.RegisterSuccess.replace('{0}', htmlEncode(this.state.username)).replace('{1}', htmlEncode(this.state.email))

			return (
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-12">
							<div class="card card-form">
								<div class="card-header">
									<h2>{t.Generic.Register}</h2>
								</div>
								<div class="card-body">
									<p class="mb-3" dangerouslySetInnerHTML={{__html: resgister_success }} />
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		} else {
			const validationError = (t.Error[this.state.validationError] || '').replace('{0}', htmlEncode(this.state.validation0 || ''))  || t.Error.UnknownError;

			return (
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-12">
							<form class="needs-validation" noValidate={true} ref="form">
								<div class="card card-form">
									<div class="card-header">
										<h2>{t.Generic.Register}</h2>
									</div>
									<div class="card-body">
										<div class="form-group row">
											<label for="register_username"><b>{t.Generic.Username + ':'}</b></label>
											<input ref="username" type="text" class="form-control" id="register_username" required={true} pattern="[a-zA-Z0-9_\-]{6,}" disabled={allDisabled}/>
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterUsername}
											</div>
										</div>
										<div class="form-group row">
											<label for="register_email"><b>{t.Generic.Email + ':'}</b></label>
											<input ref="email" type="email" class="form-control" id="register_email" required={true} disabled={allDisabled}/>
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterEmail}
											</div>
										</div>
										<div class="form-group row">
											<label for="register_password"><b>{t.Generic.Password + ':'}</b></label>
											<input ref="password" type="password" class="form-control" id="register_password" required={true} pattern=".{8,}" disabled={allDisabled} />
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterPassword}
											</div>
										</div>
										<div class="form-group row">
											<label for="register_confirm_password"><b>{t.Generic.ConfirmPassword + ':'}</b></label>
											<input ref="confirm_password" type="password" class="form-control" id="register_confirm_password" required={true} pattern=".{8,}" disabled={allDisabled} />
											<div class="invalid-feedback">
												{t.Validation.PleaseReEnterPassword}
											</div>
										</div>
										<div class="form-group row" style={{display: !!this.state.validationError ? 'flex' : 'none' }}>
											<div class="alert alert-danger" style={{width: '100%'}} dangerouslySetInnerHTML={{__html: validationError}} />
										</div>
									</div>
									<div class="card-footer">
										<div class="small-vert-padding pull-right">
											<button type="submit" class="btn btn-success btn-lg" disabled={allDisabled}>{t.Generic.Register}</button>
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