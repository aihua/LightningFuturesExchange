import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import ForgotPasswordStore from '../../../stores/forgotpasswordstore.js'
import * as ForgotPasswordActions from  '../../../actions/forgotpasswordactions.js'
import * as LoginActions from  '../../../actions/loginactions.js'

import { htmlEncode } from 'js-htmlencode';
import queryString from 'query-string';

export default class ConfirmForgotPasswordPage extends React.Component {
	constructor() {
		super();

		this.state = {
			checkError: '',
			checkError0: '',
			checkForgotPasswordSuccess: false,
			confirmError: '',
			confirmError0: '',
			confirmForgotPasswordSuccess: false			
		}
	}

	componentWillMount() {
		LoginActions.changeLoggedInState('loggedout');
		ForgotPasswordStore.on('changedCheckForgotPasswordStatus', this.changedCheckForgotPasswordStatus);
		ForgotPasswordStore.on('changedConfirmForgotPasswordStatus', this.changedConfirmForgotPasswordStatus);

		this.query = queryString.parse(this.props.location.search);


		if (!this.query.userid || !this.query.token) {
			this.setState({
				error: "InvalidUrl",
				error0: ''
			})
		} else {
			ForgotPasswordActions.checkForgotPassword(this.query.userid, this.query.token)
		}
	}

	componentDidMount() {
		this.refs.form.addEventListener('submit', (event) => {
			if (this.refs.form.checkValidity() === false) {
				event.preventDefault();
				event.stopPropagation();
			} else if (this.refs.password.value !== this.refs.confirm_password.value) {
				this.setState({
					"confirmError": "PasswordsMustMatch",
					"confirmError0": ''
				});
				event.preventDefault();
				event.stopPropagation();
			} else {
				ForgotPasswordActions.confirmForgotPassword(this.query.userid, this.query.token, this.refs.password.value);
			}

			this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		ForgotPasswordStore.removeListener('changedCheckForgotPasswordStatus', this.changedCheckForgotPasswordStatus);
		ForgotPasswordStore.removeListener('changedConfirmForgotPasswordStatus', this.changedConfirmForgotPasswordStatus);		
	}

	changedCheckForgotPasswordStatus = () => {
		if (ForgotPasswordStore.checkForgotPasswordStatus === 'error') {
			this.setState({
				checkError: ForgotPasswordStore.checkForgotPasswordError.message || 'UnknownError',
				checkError0: ForgotPasswordStore.checkForgotPasswordError[0]
			});
		} else {
			if (ForgotPasswordStore.checkForgotPasswordStatus === 'fetching') {
				this.setState({
					checkError: '',
					checkError0: ''
				})
			} else {
				if (ForgotPasswordStore.checkForgotPasswordStatus === 'fetched') {
					this.setState({
						checkError: '',
						checkError0: '',
						checkForgotPasswordSuccess: true
					});
				}
			}
		}
	}

	changedConfirmForgotPasswordStatus = () => {
		if (ForgotPasswordStore.confirmForgotPasswordStatus === 'error') {
			this.setState({
				confirmError: ForgotPasswordStore.confirmForgotPasswordError.message || 'UnknownError',
				confirmError0: ForgotPasswordStore.confirmForgotPasswordError[0]
			});
		} else {
			if (ForgotPasswordStore.confirmForgotPasswordStatus === 'fetching') {
				this.setState({
					confirmError: '',
					confirmError0: ''
				})
			} else {
				if (ForgotPasswordStore.confirmForgotPasswordStatus === 'fetched') {
					this.setState({
						confirmrror: '',
						confirmError0: '',
						confirmForgotPasswordSuccess: true
					});
				}
			}
		}
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		if (this.state.confirmForgotPasswordSuccess) {
			let user = ForgotPasswordStore.confirmUser;
			let messageBody = t.ForgotPassword.ConfirmForgotPasswordSuccess.replace('{0}', htmlEncode(user.username));

			return (
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-12">
							<div class="card card-form">
								<div class="card-header">
									<h2>{t.Generic.ChangePassword}</h2>
								</div>
								<div class="card-body">
									<p class="mb-3" dangerouslySetInnerHTML={{__html: messageBody }} />
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		} else {			
			const allDisabled = ForgotPasswordStore.checkForgotPasswordStatus === 'fetching' 
			|| this.state.checkError !== '' 
			|| ForgotPasswordStore.confirmForgotPasswordStatus === 'fetching'

			const validationError = (t.Error[this.state.checkError] || '').replace('{0}', htmlEncode(this.state.checkError0 || ''))
								 || (t.Error[this.state.confirmError] || '').replace('{0}', htmlEncode(this.state.checkConfirm0 || ''))
								 || t.Error.UnknownError;


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
											<label for="confirm_forgot_password_username"><b>{t.Generic.Username + ':'}</b></label>
											<label id="confirm_forgot_password_username">{(ForgotPasswordStore.checkUser || {}).username || ''}</label>
										</div>
										<div class="form-group row">
											<label for="confirm_forgot_password_email"><b>{t.Generic.Email + ':'}</b></label>
											<label id="confirm_forgot_password_email">{(ForgotPasswordStore.checkUser || {}).email || ''}</label>
										</div>
										<div class="form-group row">
											<label for="confirm_forgot_password_password"><b>{t.Generic.Password + ':'}</b></label>
											<input ref="password" type="password" class="form-control" id="confirm_forgot_password_password" required={true} pattern=".{8,}" disabled={allDisabled} />
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterPassword}
											</div>
										</div>
										<div class="form-group row">
											<label for="confirm_forgot_password_confirm_password"><b>{t.Generic.ConfirmPassword + ':'}</b></label>
											<input ref="confirm_password" type="password" class="form-control" id="confirm_forgot_password_confirm_password" required={true} pattern=".{8,}" disabled={allDisabled} />
											<div class="invalid-feedback">
												{t.Validation.PleaseReEnterPassword}
											</div>
										</div>
										<div class="form-group row" style={{display: (this.state.checkError || this.state.confirmError) ? 'flex' : 'none' }}>
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