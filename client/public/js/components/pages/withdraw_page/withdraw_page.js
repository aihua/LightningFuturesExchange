import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import LoginStore from '../../../stores/loginstore.js'
import * as LoginActions from  '../../../actions/loginactions.js'

import QRCode from "qrcode-react";

import { htmlEncode } from 'js-htmlencode'
import moment from "moment";

import _ from "underscore"
import $ from 'jquery'

import WAValidator from 'wallet-address-validator'

import {NotificationContainer, NotificationManager} from 'react-notifications';

export default class WithdrawPage extends React.Component {
	constructor() {
		super();

		this.state = {
			address: '',
			amount: '',
			fetchError: '',
			fetchError0: '',
			requestWithdrawalError: '',
			requestWithdrawalError0: '',
			requestedWithdrawalSuccess: false
		}
	}

	componentWillMount() {
		LoginStore.on('changedGetWithdrawalsStatus', this.changedGetWithdrawalsStatus);
		LoginStore.on('changedRequestWithdrawalStatus', this.changedRequestWithdrawalStatus);
		LoginStore.on('changedResendWithdrawalRequestStatus', this.changedResendWithdrawalRequestStatus);
		
		if (!LoginStore.user && LoginStore.loggedInState !== 'unknown') window.location.href = '#';

		LoginActions.getWithdrawals();
	}

	componentDidMount() {
		this.refs.form.addEventListener('submit', (event) => {
			if (this.refs.form.checkValidity() === false) {
				event.preventDefault();
				event.stopPropagation();
			} else {
				LoginActions.requestWithdraw(this.state.address, parseInt(parseFloat(this.state.amount)*10000000000)); 
			}

			this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		LoginStore.removeListener('changedGetWithdrawalsStatus', this.changedGetWithdrawalsStatus);
		LoginStore.removeListener('changedRequestWithdrawalStatus', this.changedRequestWithdrawalStatus);
		LoginStore.removeListener('changedResendWithdrawalRequestStatus', this.changedResendWithdrawalRequestStatus);		
	}


	changedGetWithdrawalsStatus = () => {
		if (LoginStore.getWithdrawalsStatus === 'error') {
			this.setState({
				fetchError: LoginStore.getWithdrawalsError.message || 'UnknownError',
				fetchError0: LoginStore.getWithdrawalsError['0'] || ''
			})
		} else if (LoginStore.getWithdrawalsStatus === 'fetching') {
			this.setState({
				fetchError: '',
				fetchError0: ''
			})
		} else if (LoginStore.getWithdrawalsStatus === 'fetched') {
			this.setState({
				fetchError: '',
				fetchError0: ''
			})
		}
	}

	changedRequestWithdrawalStatus = () => {
		if (LoginStore.requestWithdrawalStatus === 'error') {
			this.setState({
				requestWithdrawalError: LoginStore.requestWithdrawalError.message || 'UnknownError',
				requestWithdrawalError0: LoginStore.requestWithdrawalError['0'] || '',
				requestedWithdrawalSuccess: false
			});
		} else if (LoginStore.requestWithdrawalStatus === 'fetching') {
			this.setState({
				requestWithdrawalError: '',
				requestWithdrawalError0: '',
				requestedWithdrawalSuccess: false
			});
		} else if (LoginStore.requestWithdrawalStatus === 'fetched') {
			this.refs.form.classList.remove('was-validated');

			this.setState({
				address: '',
				amount: '',
				requestWithdrawalError: '',
				requestWithdrawalError0: '',
				requestedWithdrawalSuccess: true
			});
		}
	}

	changedResendWithdrawalRequestStatus = () => {
		const t = I18nStore.getCurrentLanguageJSON();

		if (LoginStore.resendWithdrawalRequestStatus === 'fetched') {
			NotificationManager.success(t.RequestWithdrawal.ResendRequestSuccess);
		} else if (LoginStore.resendWithdrawalRequestStatus === 'error') {
			NotificationManager.error(t.RequestWithdrawal.ResendRequestError);
		}
		this.forceUpdate();
	}

	withdraw = () => {
		LoginActions.requestWithdraw();
	}

	qRClick = (address) => {
		return (e) => {
			LoginActions.openQRDialog(address);
			e.preventDefault();
			return false;
		}
	}

	reSend = (withdrawal) => {
		return (e) => {
			LoginActions.resendWithdrawalRequest(withdrawal.withdrawalId);
			e.preventDefault();
			return false;
		}
	}

	changeAddress = (e) => {
		if (WAValidator.validate(e.target.value)) {
			e.target.setCustomValidity('')
		} else {
			const t = I18nStore.getCurrentLanguageJSON();
			e.target.setCustomValidity('error')
		}

		this.setState({
			address: e.target.value
		})
	}

	changeAmount = (e) => {
		this.setState({
			amount: e.target.value
		})
	}

	closeSuccess = (e) => {
		this.setState({
			requestedWithdrawalSuccess: false
		})
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		const allDisabled = LoginStore.getWithdrawalsStatus === 'fetching' || 
			LoginStore.requestWithdrawalStatus === 'fetching' ||
			LoginStore.resendWithdrawalRequestStatus === 'fetching' ||
			this.state.fetchError !== ''; 

		const validationError = (t.Error[this.state.fetchError] || t.Error[this.state.requestWithdrawalError] || '').replace('{0}', htmlEncode(this.state.fetchError0 || this.state.requestWithdrawalError0 || '')) || t.Error.UnknownError;
		const successMessage = t.RequestWithdrawal.RequestSuccess
			.replace('{0}', htmlEncode(((LoginStore.requestedWithdrawal.amount / 10000000000) + '') || ''))
			.replace('{1}', htmlEncode(LoginStore.requestedWithdrawal.address || ''));

		return (
			<div id="withdraw-page" class="container-fluid">
				<div class="row">
					<div class="col-md-12">
						<form class="needs-validation" noValidate={true} ref="form">
							<div class="card card-form">
								<div class="card-header">
									<h2>{t.Generic.Withdrawal}</h2>
								</div>
								<div class="card-body">
									<div class="form-group row">
										<label for="withdraw-address"><b>{t.Generic.Address + ':'}</b></label>
										<input ref="address" type="text" class="form-control" id="withdraw-address" disabled={allDisabled} autoComplete="off" value={this.state.address} onChange={this.changeAddress} required={true} />
										<div class="invalid-feedback">
											{t.Validation.PleaseEnterBitcoinAddress}
										</div>
									</div>
									<div class="form-group row">
										<label for="withdraw-amount"><b>{t.Generic.Amount + ' (BTC):'}</b></label>
										<input ref="amount" type="number" min class="form-control" id="withdraw-amount" disabled={allDisabled} autoComplete="off" value={this.state.amount} onChange={this.changeAmount} min="0.00" step="0.00000001" required={true}/>
										<div class="invalid-feedback">
											{t.Validation.PleaseEnterBitcoinAmount}
										</div>
									</div>
									<div class="form-group row" style={{display: (!!this.state.fetchError || !!this.state.requestWithdrawalError) ? 'flex' : 'none' }}>
										<div class="alert alert-danger" style={{width: '100%'}} dangerouslySetInnerHTML={{__html: validationError}} />
									</div>
									<div class="form-group row" style={{display: (this.state.requestedWithdrawalSuccess) ? 'flex' : 'none' }}>
										<div class="alert alert-success" style={{width: '100%'}}>
											<button type="button" class="close" onClick={this.closeSuccess}>
												<span aria-hidden="true">&times;</span>
											</button>
											<span dangerouslySetInnerHTML={{__html: successMessage}} />
										</div>
									</div>
								</div>
								<div class="card-footer">
									<div class="small-vert-padding pull-right">
										<button type="submit" class="btn btn-danger btn-lg" disabled={allDisabled}>{t.Generic.Withdraw}</button>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
				{LoginStore.withdrawals ? <div class="row">
					<div class="col-md-12">
						<h2>{t.Generic.Withdrawals}</h2>
						<div style={{"overflow": 'auto'}}>
							<table class="table mb-0">
								<thead>
									<tr>
										<th scope="col">#</th>
										<th scope="col">{t.Generic.Address}</th>
										<th scope="col">{t.Generic.Amount + '(BTC)'}</th>
										<th scope="col">{t.Generic.TransactionId}</th>
										<th scope="col">{t.Generic.Created}</th>
										<th scope="col">{t.Generic.Confirmed}</th>
										<th scope="col">{t.Generic.Sent}</th>
										<th scope="col">{t.Generic.Status}</th>
										<th scope="col">{t.Generic.Resend}</th>
									</tr>
								</thead>
								<tbody>
									{LoginStore.withdrawals.length ? _.map(LoginStore.withdrawals, (withdrawal, r) => {
										let status = '';

										if (withdrawal.cancelled) {
											status = t.Generic.Cancelled;
										} else if (withdrawal.sentDate) {
											status = t.Generic.Sent
										} else if (withdrawal.confirmedDate) {
											status = t.Generic.Confirmed
										} else {
											status = t.Generic.WaitingConfirmation											
										}

										return (
											<tr key={r}>
												<th>{r + 1}</th>
												<td>{withdrawal.address}</td>
												<td>{withdrawal.amount/10000000000}</td>
												<td>{withdrawal.transactionId || '---'}</td>
												<td>{withdrawal.createdDate ? moment(withdrawal.createdDate).format("MMM Do YYYY") : '---'}</td>
												<td>{withdrawal.confirmedDate ? moment(withdrawal.confirmedDate).format("MMM Do YYYY") : '---'}</td>
												<td>{withdrawal.sentDate ? moment(withdrawal.sentDate).format("MMM Do YYYY") : '---'}</td>
												<td>{status}</td>
												<td>
													{(!withdrawal.confirmedDate && !withdrawal.cancelled) ? <a href="#" onClick={this.reSend(withdrawal)} disabled={allDisabled}>{t.Generic.Resend}</a> : null }
												</td>
											</tr>
										);
									}) : (
										<tr>
											<td colSpan="9" class="text-center">
												{t.Generic.NoWithdrawals}
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div> : null}
				<NotificationContainer/>
			</div>
		)
	}
}