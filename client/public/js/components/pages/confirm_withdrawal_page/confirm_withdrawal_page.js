import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import LoginStore from '../../../stores/loginstore.js'

import * as LoginActions from  '../../../actions/loginactions.js'

import { htmlEncode } from 'js-htmlencode';
import queryString from 'query-string';

import PropTypes from 'prop-types';

export default class ConfirmWithdrawalPage extends React.Component {
	constructor() {
		super();

		this.state = {
			checkError: '',
			checkError0: '',
			requestedWithdrawalSuccess: false,
			confirmError: '',
			confirmError0: '',
			confirmWithdrawalSuccess: false			
		}
	}

	static propTypes = {
		isCancellation: PropTypes.bool.required
	}

	componentWillMount() {
		LoginStore.on('changedGetWithdrawalRequestStatus', this.changedGetWithdrawalRequestStatus);
		LoginStore.on('changedConfirmWithdrawalStatus', this.changedConfirmWithdrawalStatus);
		LoginStore.on('changedCancelWithdrawalStatus', this.changedCancelWithdrawalStatus);

		this.query = queryString.parse(this.props.location.search);

		if (!this.query.userid || !this.query.withdrawalid || !this.query.withdrawaltoken) {
			this.setState({
				error: "InvalidUrl",
				error0: ''
			})
		} else {
			LoginActions.getWithdrawalRequest(this.query.userid, this.query.withdrawalid, this.query.withdrawaltoken);
		}
	}

	componentDidMount() {
		this.refs.form.addEventListener('submit', (event) => {
			if (this.refs.form.checkValidity() === false) {
				event.preventDefault();
				event.stopPropagation();
			} else {
				if (this.props.isCancellation) {
					LoginActions.cancelWithdrawal(this.query.userid, this.query.withdrawalid, this.query.withdrawaltoken, this.refs.password.value, this.refs.twofaToken.value);
				} else {
					LoginActions.confirmWithdrawal(this.query.userid, this.query.withdrawalid, this.query.withdrawaltoken, this.refs.password.value, this.refs.twofaToken.value);
				}
			}

			this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		LoginStore.removeListener('changedGetWithdrawalRequestStatus', this.changedGetWithdrawalRequestStatus);
		LoginStore.removeListener('changedConfirmWithdrawalStatus', this.changedConfirmWithdrawalStatus);
		LoginStore.removeListener('changedCancelWithdrawalStatus', this.changedCancelWithdrawalStatus);
	}

	changedGetWithdrawalRequestStatus = () => {
		if (LoginStore.getWithdrawalRequestStatus === 'error') {
			this.setState({
				checkError: LoginStore.getWithdrawalRequestError.message || 'UnknownError',
				checkError0: LoginStore.getWithdrawalRequestError[0]
			});
		} else {
			if (LoginStore.getWithdrawalRequestStatus === 'fetching') {
				this.setState({
					checkError: '',
					checkError0: ''
				})
			} else {
				if (LoginStore.getWithdrawalRequestStatus === 'fetched') {
					this.setState({
						checkError: '',
						checkError0: '',
						requestedWithdrawalSuccess: true
					});
				}
			}
		}
	}

	changedConfirmWithdrawalStatus = () => {
		if (LoginStore.confirmWithdrawalStatus === 'error') {
			this.setState({
				confirmError: LoginStore.confirmWithdrawalError.message || 'UnknownError',
				confirmError0: LoginStore.confirmWithdrawalError[0]
			});
		} else {
			if (LoginStore.confirmWithdrawalStatus === 'fetching') {
				this.setState({
					confirmError: '',
					confirmError0: ''
				})
			} else {
				if (LoginStore.confirmWithdrawalStatus === 'fetched') {
					this.setState({
						confirmError: '',
						confirmError0: '',
						confirmWithdrawalSuccess: true
					});
				}
			}
		}
	}

	changedCancelWithdrawalStatus = () => {
		if (LoginStore.cancelWithdrawalStatus === 'error') {
			this.setState({
				confirmError: LoginStore.cancelWithdrawalError.message || 'UnknownError',
				confirmError0: LoginStore.cancelWithdrawalError[0]
			});
		} else {
			if (LoginStore.cancelWithdrawalStatus === 'fetching') {
				this.setState({
					confirmError: '',
					confirmError0: ''
				})
			} else {
				if (LoginStore.cancelWithdrawalStatus === 'fetched') {
					this.setState({
						confirmError: '',
						confirmError0: '',
						confirmWithdrawalSuccess: true
					});
				}
			}
		}
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		if (this.state.confirmWithdrawalSuccess) {
			let user = LoginStore.confirmUser;
			let withdrawal = LoginStore.withdrawal;
			let messageBody = t.RequestWithdrawal[this.props.isCancellation ? 'CancelWithdrawalSuccessBody' : 'ConfirmWithdrawalSuccessBody'].replace('{0}', htmlEncode((withdrawal.amount / 10000000000) + '')).replace('{1}', htmlEncode(withdrawal.address));

			return (
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-12">
							<div class="card card-form">
								<div class="card-header">
									<h2>{t.Generic[this.props.isCancellation ? 'CancelWithdrawal' : 'ConfirmWithdrawal']}</h2>
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
			const allDisabled = LoginStore.getWithdrawalRequestStatus === 'fetching' 
			|| this.state.checkError !== '' 
			|| LoginStore.confirmWithdrawalStatus === 'fetching'
			|| LoginStore.cancelWithdrawalStatus === 'fetching'

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
										<h2>{t.Generic[this.props.isCancellation ? 'CancelWithdrawal' : 'ConfirmWithdrawal']}</h2>
									</div>
									<div class="card-body">
										<div class="form-group row">
											<span dangerouslySetInnerHTML={{__html: t.RequestWithdrawal[this.props.isCancellation ? 'ExplanationCancel' : 'ExplanationConfirm'] }} />
										</div>
										<div class="form-group row">
											<label for="confirm_withdrawal_username"><b>{t.Generic.Username + ':'}</b></label>
											<label id="confirm_withdrawal_username" class=" w-100" style={{wordWrap: "break-word"}}>{(LoginStore.checkUser || {}).username || ''}</label>
										</div>
										<div class="form-group row">
											<label for="confirm_withdrawal_email"><b>{t.Generic.Email + ':'}</b></label>
											<label id="confirm_withdrawal_email" class=" w-100" style={{wordWrap: "break-word"}}>{(LoginStore.checkUser || {}).email || ''}</label>
										</div>
										<div class="form-group row">
											<label for="confirm_withdrawal_amount"><b>{t.Generic.Amount + ':'}</b></label>
											<label id="confirm_withdrawal_amount" class=" w-100" style={{wordWrap: "break-word"}}>{(((LoginStore.withdrawal || {}).amount / 10000000000 )|| '0') + ' BTC' }</label>
										</div>
										<div class="form-group row">
											<label for="confirm_withdrawal_address"><b>{t.Generic.Address + ':'}</b></label>
											<label id="confirm_withdrawal_address" class=" w-100" style={{wordWrap: "break-word"}}>{(LoginStore.withdrawal || {}).address || ''}</label>
										</div>										
										<div class="form-group row">
											<label for="confirm_withdrawal_password"><b>{t.Generic.Password + ':'}</b></label>
											<input ref="password" type="password" class="form-control" id="confirm_withdrawal_password" required={true} pattern=".{8,}" disabled={allDisabled} />
											<div class="invalid-feedback">
												{t.Validation.PleaseEnterPassword}
											</div>
										</div>
										<div class="form-group row">
											<label for="confirm_withdrawal_2fa"><b>{t.Generic.TwoFactorToken + ':'}</b></label>
											<input ref="twofaToken" type="text" class="form-control" id="confirm_withdrawal_2fa" pattern="[0-9]{6,6}" disabled={allDisabled} autoComplete="off"/>
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
											<button type="submit" class={"btn btn-" + (this.props.isCancellation ? 'danger' : 'success') + " btn-lg"} disabled={allDisabled}>{t.Generic[this.props.isCancellation ? 'Cancel' : 'Confirm']}</button>
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