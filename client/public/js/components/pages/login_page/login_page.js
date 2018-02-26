import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import LoginStore from '../../../stores/loginstore.js'
import * as LoginActions from  '../../../actions/loginactions.js'

import { htmlEncode } from 'js-htmlencode'
import { Link } from "react-router-dom";

export default class LoginPage extends React.Component {
	constructor() {
		super();

		this.state = {
			validationError: '',
			validation0: '',
			loginSuccess: false,
			username: ''
		}
	}

	componentWillMount() {
		LoginActions.changeLoggedInState('loggedout');

		LoginStore.on('changedLoggedInStatus', this.changedLoggedInStatus);
	}

	componentDidMount() {
		this.refs.form.addEventListener('submit', (event) => {
			if (this.refs.form.checkValidity() === false) {
				event.preventDefault();
				event.stopPropagation();
			} else {
				LoginActions.login(this.refs.username.value, this.refs.password.value, this.refs.twofaToken.value);
			}

			this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		LoginStore.removeListener('changedLoggedInStatus', this.changedLoggedInStatus);
	}

	changedLoggedInStatus = () => {
		if (LoginStore.loginStatus === 'error') {
			this.setState({
				"validationError": LoginStore.loginError.message || 'UnknownError',
				"validation0": LoginStore.loginError['0']
			});
		} else {
			if (LoginStore.loginStatus === 'fetching') {
				this.setState({
					validationError: '',
					username: this.refs.username.value
				})
			} else {
				if (LoginStore.loginStatus === 'fetched') {
					this.props.history.push('/');
				}
			}
		}
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();
		const validationError = (t.Error[this.state.validationError] || '').replace('{0}', htmlEncode(this.state.validation0 || ''))  || t.Error.UnknownError;

		const allDisabled = LoginStore.loginStatus === 'fetching';

		return (
			<div class="container-fluid">
				<div class="row">
					<div class="col-md-12">
						<form class="needs-validation" noValidate={true} ref="form">
							<div class="card card-form">
								<div class="card-header">
									<h2>{t.Generic.Login}</h2>
								</div>
								<div class="card-body">
									<div class="form-group row">
										<label for="login_username"><b>{t.Generic.Username + '/' + t.Generic.Email + ':'}</b></label>
										<input ref="username" type="text" class="form-control" id="login_username" required={true} disabled={allDisabled}/>
										<div class="invalid-feedback">
											{t.Validation.PleaseEnterUsername}
										</div>
									</div>
									<div class="form-group row">
										<label for="login_password"><b>{t.Generic.Password + ':'}</b></label>
										<input ref="password" type="password" class="form-control" id="login_password" required={true} pattern=".{8,}" disabled={allDisabled}/>
										<div class="invalid-feedback">
											{t.Validation.PleaseEnterPassword}
										</div>
									</div>
									<div class="form-group row">
										<label for="login_2fa"><b>{t.Generic.TwoFactorToken + ':'}</b></label>
										<input ref="twofaToken" type="text" class="form-control" id="login_2fa" pattern="[0-9]{6,6}" disabled={allDisabled}/>
										<div class="invalid-feedback">
											{t.Validation.PleaseEnter2FA}
										</div>
									</div>
									<div class="form-group row pull-right" style={{float: 'right'}}>
										<Link to={'/forgot_password'}>{t.Generic['ForgotPassword?']}</Link>
									</div>
									<div class="form-group row" style={{display: !!this.state.validationError ? 'flex' : 'none' }}>
										<div class="alert alert-danger" style={{width: '100%'}} dangerouslySetInnerHTML={{__html: validationError}} />
									</div>
								</div>
								<div class="card-footer">
									<div class="small-vert-padding pull-right">
										<button type="submit" class="btn btn-primary btn-lg" disabled={allDisabled}>{t.Generic.Login}</button>
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