import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../../stores/i18nstore.js'
import ConfigStore from '../../../../stores/configstore.js'
import * as ConfigActions from '../../../../actions/configactions.js'

import Helpers from '../../../../helpers/helpers.js'

import $ from 'jquery';
import _ from 'underscore';

import * as ConfirmDialogActions from  '../../../../actions/confirmdialogactions.js'
import ConfirmDialogStore from '../../../../stores/confirmdialogstore.js';

export default class ManageExchangesAndWalletsDialog extends React.Component {
	constructor() {
		super()

		this.state = { 
			config: {},
			selectedExchangeIndex: -1,
			selectedWalletIndex: -1,
			validationError: '',
			disabledAll: false
		}
	}

	componentWillMount() {
		ConfigStore.on('manageExchangeAndWalletsClicked', this.resetConfig)
		ConfigStore.on('changedSaveConfigStatus', this.changedSaveConfigStatus)
		ConfigStore.on('changedConfigPocession', this.changedConfigPocession)
		ConfirmDialogStore.on('closeConfirmDialog', this.closeConfirmDialog)
	}

	componentDidMount() {
		$(this.refs.modal).modal({
			backdrop: 'static',
			show: false
		})
	}

	componentWillUnmount() {
		ConfigStore.unbindListener('manageExchangeAndWalletsClicked', this.resetConfig);
		ConfigStore.unbindListener('changedSaveConfigStatus', this.changedSaveConfigStatus);		
		ConfigStore.unbindListener('changedConfigPocession', this.changedConfigPocession)
		ConfirmDialogStore.unbindListener('closeConfirmDialog', this.closeConfirmDialog)
	}

	changedSaveConfigStatus = () => {
		if (ConfigStore.saveConfigStatus === 'fetching') {
			this.setState({
				disabledAll: true,
				validationError: ''
			})
		} else if (ConfigStore.saveConfigStatus === 'fetched') {
			$(this.refs.modal).modal('hide');
		} else {
			this.setState({
				disabledAll: false,
				validationError: ConfigStore.saveConfigError,
			})
		}
	}

	changedConfigPocession = () => {
		if (ConfigStore.requiresLogin || ConfigStore.requiresCreatePassword) {
			$(this.refs.modal).modal('hide');
		}
	}

	closeConfirmDialog =  () => {
		if (ConfirmDialogStore.lastClicked === 'yes') {
			$(this.refs.modal).modal('hide');
		} else {
			setTimeout(() => {
				$(this.refs.modal).modal('show')
			}, 500);
		}
	}

	createTempConfig = () => {
		let t_config = {
			exchanges: _.map((ConfigStore.config || {}).exchanges || [], function (e) {
				return {
					name: e.name || '',
					publicKey: e.publicKey || '',
					address: e.address || '',
					wallets: _.map(e.wallets || [], function (w) {
						return {
							name: w.name || '',
							publicKey: w.publicKey || ''
						}
					})
				}
			})
		};

		t_config.exchanges.sort(Helpers.ci_comparer)
		_.each(t_config.exchanges, function (e) { e.wallets.sort(Helpers.ci_comparer); });

		return t_config;
	}

	resetConfig = () => {
		let t_config = this.createTempConfig();
		let t_config2 = this.createTempConfig();

		const selectedExchangeIndex = t_config.exchanges.length ? 0 : -1;
		const selectedWalletIndex = selectedExchangeIndex === -1 ? -1 : (t_config.exchanges[selectedExchangeIndex].wallets.length ? 0 : -1);

		this.setState({
			i_config: t_config2,
			config: t_config,
			selectedExchangeIndex: selectedExchangeIndex,
			selectedWalletIndex: selectedWalletIndex
		})
	}

	selectedExchangeChanged = (e) => {
		this.setState({
			selectedExchangeIndex: e.nativeEvent.target.selectedIndex,
			selectedWalletIndex: this.state.config.exchanges[e.nativeEvent.target.selectedIndex].wallets.length ? 0 : -1
		});
	}

	selectedWalletChanged = (e) => {
		this.setState({
			selectedWalletIndex: e.nativeEvent.target.selectedIndex
		});
	}

	addExchange = () => {
		let t_config = this.state.config;

		let exchangeNameIndex = 1;
		let selectedExchangeIndex = this.state.selectedExchangeIndex;

		while (true) {
			let foundExchange = false;

			for (let i = 0; i < t_config.exchanges.length; i++) {
				if (t_config.exchanges[i].name.toLowerCase() === 'exchange ' + exchangeNameIndex) {
					foundExchange = true;
					break;
				}
			}

			if (!foundExchange) {
				t_config.exchanges.push({
					name: 'Exchange ' + exchangeNameIndex,
					publicKey: '',
					address: '',
					wallets: []
				});

				if (selectedExchangeIndex === -1) selectedExchangeIndex = 0;
				break;
			} else {
				exchangeNameIndex += 1;
			}
		}

		this.setState({
			config: t_config,
			selectedExchangeIndex: selectedExchangeIndex
		});
	}

	removeExchange = () => {
		this.state.config.exchanges.splice(this.state.selectedExchangeIndex, 1);

		if (this.state.selectedExchangeIndex >= this.state.config.exchanges.length) this.state.selectedExchangeIndex--;

		if (this.state.selectedExchangeIndex === -1) {
			this.state.selectedWalletIndex = -1;
		} else {
			this.state.selectedWalletIndex = this.state.config.exchanges[this.state.selectedExchangeIndex].wallets.length ? 0 : -1;
		}

		this.setState({
			config: this.state.config,
			selectedExchangeIndex: this.state.selectedExchangeIndex,
			selectedWalletIndex: this.state.selectedWalletIndex
		});
	}

	addWallet = () => {
		let t_config = this.state.config;

		let walletNameIndex = 1;
		let selectedExchangeIndex = this.state.selectedExchangeIndex;
		let selectedWalletIndex = this.state.selectedWalletIndex;

		let exchange = t_config.exchanges[selectedExchangeIndex];

		while (true) {
			let foundWallet = false;

			for (let i = 0; i < exchange.wallets.length; i++) {
				if (exchange.wallets[i].name.toLowerCase() === 'wallet ' + walletNameIndex) {
					foundWallet = true;
					break;
				}
			}

			if (!foundWallet) {
				exchange.wallets.push({
					name: 'Wallet ' + walletNameIndex,
					publicKey: ''
				});

				if (selectedWalletIndex === -1) selectedWalletIndex = 0;
				break;
			} else {
				walletNameIndex += 1;
			}
		}

		this.setState({
			config: t_config,
			selectedWalletIndex: selectedWalletIndex
		});
	}

	removeWallet = () => {
		this.state.config.exchanges[this.state.selectedExchangeIndex].wallets.splice(this.state.selectedWalletIndex, 1);

		if (this.state.selectedWalletIndex >= this.state.config.exchanges[this.state.selectedExchangeIndex].wallets.length) this.state.selectedWalletIndex--;

		this.setState({
			config: this.state.config,
			selectedWalletIndex: this.state.selectedWalletIndex
		});
	}

	exchangeNameChanged = (e) => {
		this.state.config.exchanges[this.state.selectedExchangeIndex].name = e.target.value;

		this.setState({
			config: this.state.config
		});
	}

	exchangePublicKeyChanged = (e) => {
		this.state.config.exchanges[this.state.selectedExchangeIndex].publicKey = e.target.value;

		this.setState({
			config: this.state.config
		});
	}

	exchangeAddressChanged = (e) => {
		this.state.config.exchanges[this.state.selectedExchangeIndex].address = e.target.value;

		this.setState({
			config: this.state.config
		});
	}

	walletNameChanged = (e) => {
		this.state.config.exchanges[this.state.selectedExchangeIndex].wallets[this.state.selectedWalletIndex].name = e.target.value;

		this.setState({
			config: this.state.config
		});
	}


	isValid = () => {
		let exchanges = this.state.config.exchanges;

		for (let i = 0; i < exchanges.length; i++) {
			let e = exchanges[i];

			let t_wallet_index = i === this.state.selectedExchangeIndex ? this.state.selectedWalletIndex : (e.wallets.length ? 0 : -1)

			if (e.name.trim() === '') {
				this.setState({
					selectedExchangeIndex: i,
					selectedWalletIndex: t_wallet_index,
					validationError: 'ExchangeNameRequired'
				});
				return false;
			}

			if (e.publicKey.trim() === '') {
				this.setState({
					selectedExchangeIndex: i,
					selectedWalletIndex: t_wallet_index,
					validationError: 'ExchangePublicKeyRequired'
				});
				return false;
			}
			if (e.address.trim() === '') {
				this.setState({
					selectedExchangeIndex: i,
					selectedWalletIndex: t_wallet_index,
					validationError: 'ExchangeAddressRequired'
				});
				return false;
			}
		}

		for (let i = 0; i < exchanges.length; i++) {
			let e = exchanges[i];

			for (let n = 0; n < e.wallets.length; n++) {
				let w = e.wallets[n];

				if (w.name.trim() === '') {
					this.setState({
						selectedExchangeIndex: i,
						selectedWalletIndex: n,
						validationError: 'WalletNameRequired'
					});
					return false;
				}
			}
		}

		for (let i1 = 0; i1 < exchanges.length; i1++) {
			let e1 = exchanges[i1];
			for (let i2 = i1 + 1; i2 < exchanges.length; i2++) {
				let e2 = exchanges[i2];
				if (e1.name.trim().toLowerCase() === e2.name.trim().toLowerCase()) {
					let t_wallet_index = i2 === this.state.selectedExchangeIndex ? this.state.selectedWalletIndex : (e2.wallets.length ? 0 : -1)
					this.setState({
						selectedExchangeIndex: i2,
						selectedWalletIndex: t_wallet_index,
						validationError: 'DuplicateExchangeName'
					});
					return false;
				}
			}
		}

		for (let i1 = 0; i1 < exchanges.length; i1++) {
			let e1 = exchanges[i1];
			for (let i2 = i1 + 1; i2 < exchanges.length; i2++) {
				let e2 = exchanges[i2];
				if (e1.publicKey.trim().toLowerCase() === e2.publicKey.trim().toLowerCase()) {
					let t_wallet_index = i2 === this.state.selectedExchangeIndex ? this.state.selectedWalletIndex : (e2.wallets.length ? 0 : -1)
					this.setState({
						selectedExchangeIndex: i2,
						selectedWalletIndex: t_wallet_index,
						validationError: 'DuplicateExchangePublicKey'
					});
					return false;
				}
			}
		}

		for (let i = 0; i < exchanges.length; i++) {
			let e = exchanges[i];

			for (let n1 = 0; n1 < e.wallets.length; n1++) {
				let w1 = e.wallets[n1];
				for (let n2 = n1 + 1; n2 < e.wallets.length; n2++) {
					let w2 = e.wallets[n2];
					if (w1.name.trim().toLowerCase() === w2.name.trim().toLowerCase()) {
						this.setState({
							selectedExchangeIndex: i,
							selectedWalletIndex: n2,
							validationError: 'DuplicateWalletName'
						});
						return false;
					}
				}
			}
		}

		this.setState({
			validationError: ''
		})

		return true;
	}

	hasChanges = () => {
		if (this.state.i_config.exchanges.length !== this.state.config.exchanges.length) return true;

		let t_exchanges_1 = _.map(this.state.i_config.exchanges, function (e) { return e; });
		let t_exchanges_2 = _.map(this.state.config.exchanges, function (e) { return e; });

		for (let i = 0; i < t_exchanges_1.length; i++) {
			let e1 = t_exchanges_1[i];
			let e2 = t_exchanges_2[i];

			if (e1.name !== e2.name) return true;
			if (e1.publicKey !== e2.publicKey) return true;
			if (e1.address !== e2.address) return true;
			if (e1.wallets.length !== e2.wallets.length) return true;

			for (let n = 0; n < e1.wallets.length; n++) {
				if (e1.wallets[n].name !== e2.wallets[n].name) return true;
				if (e1.wallets[n].publicKey !== e2.wallets[n].publicKey) return true;
			}
		}

		return false;
	}

	save = () => {
		if (this.isValid()) {
			if (this.hasChanges()) {
				ConfigActions.saveConfig(this.state.config);
			} else {
				$(this.refs.modal).modal('hide');
			}
		}
	}

	close = () => {
		$(this.refs.modal).modal('hide');
		if (this.hasChanges()) {
			setTimeout(function () {
				ConfirmDialogActions.openConfirmDialog('ManageExchangeAndWalletsDialog', {
					title: 'CloseWithoutSaving',
					body: 'CloseWithoutSavingConfigBody'
				});
			}, 500);
		}
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		const disabledExchangeInput = this.state.selectedExchangeIndex === -1;
		const disabledWalletInput = this.state.selectedWalletIndex === -1;
		const disabledAll = this.state.disabledAll;

		const exchangesHTML = _.map(this.state.config.exchanges, (e, i) => {
			return (<option key={"exchange " + i} value={"exchange " + i}>{e.name}</option>)
		})

		const walletsHTML = this.state.selectedExchangeIndex === -1 ? [] : _.map(this.state.config.exchanges[this.state.selectedExchangeIndex].wallets, (w, i) => {
			return (<option key={"wallet " + i} value={"wallet " + i}>{w.name}</option>)
		});

		const defaultExchange = {
			name: '',
			publicKey: '',
			address: ''
		}

		const defaultWallet = {
			name: '',
			publicKey: ''
		}

		const selectedExchange = this.state.selectedExchangeIndex === -1 ? defaultExchange: this.state.config.exchanges[this.state.selectedExchangeIndex];
		const selectedWallet = this.state.selectedWalletIndex === -1 ? defaultWallet: this.state.config.exchanges[this.state.selectedExchangeIndex].wallets[this.state.selectedWalletIndex];

		return (
			<div id="manageexchangesandwalletsmodal" class="modal fade" tabIndex="-1" role="dialog" ref="modal" aria-hidden="true">
				<form id="manageexchangesandwallets" class="needs-validation" noValidate={true} ref="form">
			 		<div class="modal-dialog" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<h5 class="modal-title">{t.Generic.ManageExchangesAndWallets}</h5>
								<button type="button" class="close" onClick={this.close}>
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div class="modal-body">
								<div class="form-group row no-margin-bottom">
									<label for="exchangelist" class="col-sm-12 col-form-label"><b>{t.Generic.Exchanges + ':'}</b></label>									
								</div>
								<div class="form-group row no-margin-bottom">
									<div class="col-sm-12">
										<select id="exchangelist" class="form-control" required={true} size="6" onChange={this.selectedExchangeChanged} value={"exchange " + this.state.selectedExchangeIndex} disabled={disabledAll}>
											{exchangesHTML}
										</select>
									</div>
								</div>
								<div class="form-group row">
									<div class="col-sm-12 pull-right">
										<button type="button" class="btn btn-success btn-sm" onClick={this.addExchange} disabled={disabledAll}>{t.Generic.Add}</button>
										<button type="button" class="btn btn-danger btn-sm" onClick={this.removeExchange} disabled={disabledExchangeInput || disabledAll}>{t.Generic.Remove}</button>
									</div>
								</div>
								<div class="form-group row">
									<label for="exchangename" class="col-sm-3 col-form-label"><b>{t.Generic.Name + ':'}</b></label>
									<div class="col-sm-9">
										<input id="exchangename" type="text" class="form-control" required={true} disabled={disabledExchangeInput || disabledAll} value={selectedExchange.name} onChange={this.exchangeNameChanged}/>
									</div>
								</div>
								<div class="form-group row">
									<label for="exchangepublickey" class="col-sm-3 col-form-label"><b>{t.Generic.PublicKey + ':'}</b></label>
									<div class="col-sm-9">
										<input id="exchangepublickey" type="text" class="form-control" required={true} disabled={disabledExchangeInput || disabledAll} value={selectedExchange.publicKey} onChange={this.exchangePublicKeyChanged}/>
									</div>
								</div>
								<div class="form-group row">
									<label for="exchangeaddress" class="col-sm-3 col-form-label"><b>{t.Generic.Address + ':'}</b></label>
									<div class="col-sm-9">
										<input id="exchangeaddress" type="text" class="form-control" required={true} disabled={disabledExchangeInput || disabledAll} value={selectedExchange.address} onChange={this.exchangeAddressChanged}/>
									</div>
								</div>
								<div class="form-group row no-margin-bottom">
									<label for="walletlist" class="col-sm-12 col-form-label"><b>{t.Generic.Wallets + ':'}</b></label>
								</div>
								<div class="form-group row no-margin-bottom">
									<div class="col-sm-12">
										<select id="walletlist" class="form-control" required={true} size="6" disabled={disabledExchangeInput || disabledAll} value={"wallet " + this.state.selectedWalletIndex} onChange={this.selectedWalletChanged}>
											{walletsHTML}
										</select>
									</div>
								</div>
								<div class="form-group row">
									<div class="col-sm-12 pull-right">
										<button type="button" class="btn btn-success btn-sm" onClick={this.addWallet} disabled={disabledExchangeInput || disabledAll}>{t.Generic.Add}</button>
										<button type="button" class="btn btn-danger btn-sm" onClick={this.removeWallet} disabled={disabledWalletInput || disabledAll}>{t.Generic.Remove}</button>
									</div>
								</div>
								<div class="form-group row">
									<label for="walletname" class="col-sm-3 col-form-label"><b>{t.Generic.Name + ':'}</b></label>
									<div class="col-sm-9">
										<input id="walletname" type="text" class="form-control" required={true} disabled={disabledWalletInput || disabledAll} value={selectedWallet.name} onChange={this.walletNameChanged}/>
									</div>
								</div>
								<div class="form-group row">
									<label for="walletpublickey" class="col-sm-3 col-form-label"><b>{t.Generic.PublicKey + ':'}</b></label>
									<div class="col-sm-9">
										<input id="walletpublickey" type="text" class="form-control" disabled={true} value={selectedWallet.publicKey}/>
									</div>
								</div>
								<div class="form-group row" style={{display: !!this.state.validationError ? 'flex' : 'none' }}>
									<div class="alert alert-danger" style={{width: '100%'}}>
										{t.Validation[this.state.validationError]}
									</div>
								</div>
							</div>
							<div class="modal-footer">
								<button type="submit" class="btn btn-primary" disabled={disabledAll} onClick={this.save}>{t.Generic.Save}</button>
								<button type="submit" class="btn btn-default" disabled={disabledAll} onClick={this.close}>{t.Generic.Cancel}</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		);
	}
}