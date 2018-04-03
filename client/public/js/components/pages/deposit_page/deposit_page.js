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

export default class DepositPage extends React.Component {
	constructor() {
		super();

		this.state = {
			fetchError: '',
			fetchError0: ''
		}
	}

	componentWillMount() {
		LoginStore.on('changedGetDepositsStatus', this.changedGetDepositsStatus);
		LoginStore.on('changedCreateDepositAddressStatus', this.changedCreateDepositAddressStatus);

		if (!LoginStore.user && LoginStore.loggedInState !== 'unknown') window.location.href = '#';

		LoginActions.getDeposits();
	}

	resize_canvas = () => {
		this.$canvas = $('#deposit-page canvas');
		this.$canvas.height(this.$canvas.width());
	}

	componentDidMount() {
		$(window).resize(this.resize_canvas);
	}

	componentWillUnmount() {
		LoginStore.removeListener('changedGetDepositsStatus', this.changedGetDepositsStatus);
		LoginStore.removeListener('changedCreateDepositAddressStatus', this.changedCreateDepositAddressStatus);

		$(window).unbind('resize', this.resize_canvas);
	}


	changedGetDepositsStatus = () => {
		if (LoginStore.getDepositsStatus === 'error') {
			this.setState({
				fetchError: LoginStore.getDepositsError.message || 'UnknownError',
				fetchError0: LoginStore.getDepositsError['0'] || ''
			})
		} else if (LoginStore.getDepositsStatus === 'fetching') {
			this.setState({
				fetchError: '',
				fetchError0: ''
			})
		} else if (LoginStore.getDepositsStatus === 'fetched') {
			this.setState({
				fetchError: '',
				fetchError0: ''
			})
		}
	}

	changedCreateDepositAddressStatus = () => {
		this.forceUpdate();
	}

	createDepositAddress = () => {
		LoginActions.createDepositAddress();
	}

	qRClick = (address) => {
		return (e) => {
			LoginActions.openQRDialog(address);
			e.preventDefault();
			return false;
		}
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		setTimeout(() => {
			this.resize_canvas();
		}, 0);

		if (!LoginStore.deposits) {
			let body = '';
			if (this.state.fetchError) {
				body = this.state.fetchError.replace('{0}', this.state.fetchError0)
			} else {
				body = t.Generic.FetchingDeposits;
			}

			return (
				<div id="deposit-page" class="container-fluid">
					<div class="row">
						<div class="col-md-12">
							<form class="needs-validation" noValidate={true} ref="form">
								<div class="card card-form">
									<div class="card-header">
										<h2>{t.Generic.DepositAddress}</h2>
									</div>
									<div class="card-body">
										<p class="text-center mb-3" dangerouslySetInnerHTML={{__html: body}} />
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			)
		} else {
			const allDisabled = LoginStore.createDepositAddressStatus === 'fetching';

			let depositAddressesHTML = LoginStore.depositAddresses.length ? _.map(LoginStore.depositAddresses, (depositAddress, r) => {
				return (
					<tr key={r}>
						<th>{r + 1}</th>
						<td>{depositAddress.address}</td>
						<td>{moment(depositAddress.createdDate).format("MMM Do YYYY")}</td>
						<td class="text-center">
							<a href="#" onClick={this.qRClick(depositAddress.address)}><i class="fa fa-qrcode" /></a>
						</td>
					</tr>
				);
			}) : (
				<tr>
					<td colSpan="6">
						{t.Generic.NoDepositAddresses}
					</td>
				</tr>
			)

			let depositsHTML = LoginStore.deposits.length ? _.map(LoginStore.deposits, (deposit, r) => {
				let address = _.find(LoginStore.depositAddresses, function (depositAddress) {
					return depositAddress.addressId === deposit.addressId;
				}).address

				return (
					<tr key={r}>
						<th>{r + 1}</th>
						<td>{address}</td>
						<td>{deposit.quantity/10000000000}</td>
						<td>{deposit.transactionId}</td>						
						<td>{moment(deposit.createdDate).format("MMM Do YYYY")}</td>
						<td class="text-center">
							<a href="#" onClick={this.qRClick(address)}><i class="fa fa-qrcode" /></a>
						</td>
					</tr>
				);
			}) : (
				<tr>
					<td colSpan="6" class="text-center">
						{t.Generic.NoDeposits}
					</td>
				</tr>
			)

			return (
				<div id="deposit-page" class="container-fluid">
					<div class="row">
						<div class="col-md-12">
							<form class="needs-validation" noValidate={true} ref="form">
								<div class="card card-form">
									<div class="card-header">
										<h2>{t.Generic.DepositAddress}</h2>
									</div>
									<div class="card-body">
										<div class="w-100 text-center">
											<QRCode value={LoginStore.depositAddresses[0].address} size={256}/>
										</div>
										<div class="w-100 text-center mb-3">
											{LoginStore.depositAddresses[0].address}
										</div>
									</div>
									<div class="card-footer">
										<div class="small-vert-padding pull-right">
											<button type="button" class="btn btn-success" disabled={allDisabled} onClick={this.createDepositAddress}>{t.Generic.CreateNewAddress}</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
					<div class="row mb-4">
						<div class="col-md-12">
							<h2>{t.Generic.DepositAddresses}</h2>
							<div style={{"overflow": 'auto'}}>
								<table class="table mb-0">
									<thead>
										<tr>
											<th scope="col">#</th>
											<th scope="col">{t.Generic.Address}</th>
											<th scope="col">{t.Generic.Created}</th>
											<th scope="col">{t.Generic.QR}</th>
										</tr>
									</thead>
									<tbody>
										{depositAddressesHTML}
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-md-12">
							<h2>{t.Generic.Deposits}</h2>
							<div style={{"overflow": 'auto'}}>
								<table class="table mb-0">
									<thead>
										<tr>
											<th scope="col">#</th>
											<th scope="col">{t.Generic.Address}</th>
											<th scope="col">{t.Generic.Quantity + '(BTC)'}</th>
											<th scope="col">{t.Generic.TransactionId}</th>
											<th scope="col">{t.Generic.Created}</th>
											<th scope="col">{t.Generic.QR}</th>
										</tr>
									</thead>
									<tbody>
										{depositsHTML}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			)
		}
	}
}