import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import ForgotPasswordStore from '../../../stores/forgotpasswordstore.js'
import * as ForgotPasswordActions from  '../../../actions/forgotpasswordactions.js'
import * as LoginActions from  '../../../actions/loginactions.js'

import { htmlEncode } from 'js-htmlencode'

export default class ForgotPasswordPage extends React.Component {
	constructor() {
		super();

		this.state = {
			validationError: '',
			validation0: '',
			forgotPasswordSuccess: false,
			username: ''
		}
	}

	componentWillMount() {
		LoginActions.changeLoggedInState('loggedout');

		ForgotPasswordStore.on('changedForgotPasswordStatus', this.changedForgotPasswordStatus);
	}

	componentDidMount() {
		this.refs.form.addEventListener('submit', (event) => {
			if (this.refs.form.checkValidity() !== false) {
				ForgotPasswordActions.forgotPassword(this.refs.username.value)
			}

			event.preventDefault();
			event.stopPropagation();
			this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		ForgotPasswordStore.removeListener('changedForgotPasswordStatus', this.changedForgotPasswordStatus);
	}

	changedForgotPasswordStatus = () => {
		if (ForgotPasswordStore.forgotPasswordStatus === 'error') {
			this.setState({
				"validationError": ForgotPasswordStore.forgotPasswordError.message || 'UnknownError',
				"validation0": ForgotPasswordStore.forgotPasswordError['0']
			});
		} else {
			if (ForgotPasswordStore.forgotPasswordStatus === 'fetching') {
				this.setState({
					validationError: '',
					username: this.refs.username.value
				})
			} else {
				if (ForgotPasswordStore.forgotPasswordStatus === 'fetched') {
					this.setState({
						validationError: '',
						forgotPasswordSuccess: true
					});
				}
			}
		}
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		const allDisabled = ForgotPasswordStore.forgotPasswordStatus === 'fetching';

		if (this.state.forgotPasswordSuccess) {
			const forgot_password_success = t.Generic.ForgotPasswordSuccess.replace('{0}', htmlEncode(this.state.username))

			return (
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-12">
							<div class="card card-form">
								<div class="card-header">
									<h2>{t.Generic.ForgotPassword}</h2>
								</div>
								<div class="card-body">
									<p class="mb-3" dangerouslySetInnerHTML={{__html: forgot_password_success }} />
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
										<h2>{t.Generic.ForgotPassword}</h2>
									</div>
									<div class="card-body">
										<div class="form-group row">
											<label for="forgot_password_username"><b>{t.Generic.Username + '/' + t.Generic.Email + ':'}</b></label>
											<input ref="username" type="text" class="form-control" id="forgot_password_username" required={true} pattern="[a-zA-Z0-9_\-]{6,}|[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*" disabled={allDisabled}/>
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterUsernameOrEmail}
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