import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import ChangeEmailStore from '../../../stores/changeemailstore.js'

import * as ChangeEmailActions from  '../../../actions/changeemailactions.js'
import * as LoginActions from  '../../../actions/loginactions.js'

import { htmlEncode } from 'js-htmlencode';
import queryString from 'query-string';

export default class ConfirmChangeEmailPage extends React.Component {
	constructor() {
		super();

		this.state = {
			checkError: '',
			checkError0: '',
			checkChangeEmailSuccess: false,
			confirmError: '',
			confirmError0: '',
			confirmChangeEmailSuccess: false			
		}
	}

	componentWillMount() {
		ChangeEmailStore.on('changedCheckChangeEmailStatus', this.changedCheckChangeEmailStatus);
		ChangeEmailStore.on('changedConfirmChangeEmailStatus', this.changedConfirmChangeEmailStatus);

		this.query = queryString.parse(this.props.location.search);

		if (!this.query.userid || !this.query.token) {
			this.setState({
				error: "InvalidUrl",
				error0: ''
			})
		} else {
			ChangeEmailActions.checkChangeEmail(this.query.userid, this.query.token);
		}
	}

	componentDidMount() {
		this.refs.form.addEventListener('submit', (event) => {
			if (this.refs.form.checkValidity() === false) {
			} else {
				ChangeEmailActions.confirmChangeEmail(this.query.userid, this.query.token, this.refs.password.value, this.refs.twofaToken.value);
			}

			event.preventDefault();
			event.stopPropagation();
			this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		ChangeEmailStore.removeListener('changedCheckChangeEmailStatus', this.changedCheckChangeEmailStatus);
		ChangeEmailStore.removeListener('changedConfirmChangeEmailStatus', this.changedConfirmChangeEmailStatus);
	}

	changedCheckChangeEmailStatus = () => {
		if (ChangeEmailStore.checkChangeEmailStatus === 'error') {
			this.setState({
				checkError: ChangeEmailStore.checkChangeEmailError.message || 'UnknownError',
				checkError0: ChangeEmailStore.checkChangeEmailError[0]
			});
		} else {
			if (ChangeEmailStore.checkChangeEmailStatus === 'fetching') {
				this.setState({
					checkError: '',
					checkError0: ''
				})
			} else {
				if (ChangeEmailStore.checkChangeEmailStatus === 'fetched') {
					this.setState({
						checkError: '',
						checkError0: '',
						checkChangeEmailSuccess: true
					});
				}
			}
		}
	}

	changedConfirmChangeEmailStatus = () => {
		if (ChangeEmailStore.confirmChangeEmailStatus === 'error') {
			this.setState({
				confirmError: ChangeEmailStore.confirmChangeEmailError.message || 'UnknownError',
				confirmError0: ChangeEmailStore.confirmChangeEmailError[0]
			});
		} else {
			if (ChangeEmailStore.confirmChangeEmailStatus === 'fetching') {
				this.setState({
					confirmError: '',
					confirmError0: ''
				})
			} else {
				if (ChangeEmailStore.confirmChangeEmailStatus === 'fetched') {
					this.setState({
						confirmError: '',
						confirmError0: '',
						confirmChangeEmailSuccess: true
					});
				}
			}
		}
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		if (this.state.confirmChangeEmailSuccess) {
			let user = ChangeEmailStore.confirmUser;
			let messageBody = t.ConfirmChangeEmail.ConfirmChangeEmailSuccessBody.replace('{0}', htmlEncode(user.username)).replace('{1}', htmlEncode(user.email));

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
			const allDisabled = ChangeEmailStore.checkChangeEmailStatus === 'fetching' 
			|| this.state.checkError !== '' 
			|| ChangeEmailStore.confirmChangeEmailStatus === 'fetching'

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
										<h2>{t.Generic.ChangeEmail}</h2>
									</div>
									<div class="card-body">
										<div class="form-group row">
											<span dangerouslySetInnerHTML={{__html: t.ConfirmChangeEmail.Explanation.replace('{0}', ChangeEmailStore.checkEmail || t.Generic.Empty.toLowerCase()) }} />
										</div>
										<div class="form-group row">
											<label for="confirm_change_email_username"><b>{t.Generic.Username + ':'}</b></label>
											<label id="confirm_change_email_username">{(ChangeEmailStore.checkUser || {}).username || ''}</label>
										</div>
										<div class="form-group row">
											<label for="confirm_change_email_email"><b>{t.Generic.Email + ':'}</b></label>
											<label id="confirm_change_email_email">{(ChangeEmailStore.checkUser || {}).email || ''}</label>
										</div>
										<div class="form-group row">
											<label for="confirm_change_email_password"><b>{t.Generic.Password + ':'}</b></label>
											<input ref="password" type="password" class="form-control" id="confirm_change_email_password" required={true} pattern=".{8,}" disabled={allDisabled} />
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterPassword}
											</div>
										</div>
										<div class="form-group row">
											<label for="confirm_change_email_2fa"><b>{t.Generic.TwoFactorToken + ':'}</b></label>
											<input ref="twofaToken" type="text" class="form-control" id="confirm_change_email_2fa" pattern="[0-9]{6,6}" disabled={allDisabled} autoComplete="off"/>
											<div class="invalid-feedback">
												{t.Validation.PleaseEnter2FA}
											</div>
										</div>
										<div class="form-group row" style={{display: (this.state.checkError || this.state.confirmError) ? 'flex' : 'none' }}>
											<div class="alert alert-danger" style={{width: '100%'}} dangerouslySetInnerHTML={{__html: validationError}} />
										</div>
									</div>
									<div class="card-footer">
										<div class="small-vert-padding pull-right">
											<button type="submit" class="btn btn-success btn-lg" disabled={allDisabled}>{t.Generic.ChangeEmail}</button>
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