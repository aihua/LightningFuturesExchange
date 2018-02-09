import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

export default class OrderForm extends React.Component {
	constructor() {
		super();

		this.state = {
			buttonGroupVertical: false,
			orderType: 'market',
			stopLoss: 'none'
		}
	}

	componentDidMount() {		
		window.addEventListener("resize", this.resizeComponent)
		this.resizeComponent();

		this.refs.form.addEventListener('submit', (event) => {
	        if (this.refs.form.checkValidity() === false) {
	          event.preventDefault();
	          event.stopPropagation();
	        } else {

	        }
	        this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.resizeComponent)		
	}

	resizeComponent = (e) => {
		this.setState({
			buttonGroupVertical: this.refs.form.clientWidth < 250
		})
	}

	marketOrderClick = () => {
		this.setState({
			orderType: 'market'
		})
	}

	limitOrderClick = () => {
		this.setState({
			orderType: 'limit'
		})
	}

	liquidityOrderClick = () => {
		this.setState({
			orderType: 'liquidity'
		})
	}

	changeStopLoss = (e) => {
		this.setState({
			stopLoss: e.target.value
		})
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		const buttonGroupClass = this.state.buttonGroupVertical ? "btn-group-vertical" : "btn-group"

		const marketOrderActiveClass = this.state.orderType == 'market' ? 'active' : '';
		const limitOrderActiveClass = this.state.orderType == 'limit' ? 'active' : '';
		const liquidityOrderActiveClass = this.state.orderType == 'liquidity' ? 'active' : '';

		const displayPrice = (this.state.orderType == 'limit' || this.state.orderType == 'liquidity') ? 'flex' : 'none';
		const priceText = (this.state.orderType == 'liquidity' ? t.Generic.Offset : t.Generic.Price) + ':';

		const displayActivateStopLossAt = (this.state.stopLoss == 'market' || this.state.stopLoss == 'limit') ? 'flex' : 'none';
		const displayLimitLossPrice = (this.state.stopLoss == 'limit') ? 'flex' : 'none';


		return (
			<form id="order-form" class="needs-validation" noValidate={true} ref="form">
				<div class="form-group row">
					<label for="exchange" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.Exchange + ':'}</b></label>
					<div class="col-sm-7">
						<select id="exchange" class="form-control form-control-sm" required={true}>
							<option value="">{t.Generic.Select}</option>
							<option value="server1">Exchange 1</option>
							<option value="server2">Exchange 2</option>
						</select>
						<div class="invalid-feedback">
							{t.Validation.PleaseSelectAnExchange}
						</div>
					</div>
				</div>
				<div class="form-group row">
					<label for="wallet" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.Wallet + ':'}</b></label>
					<div class="col-sm-7">
						<select id="wallet" class="form-control form-control-sm" required={true}>
							<option value="">{t.Generic.Select}</option>
							<option value="wallet1">Wallet 1</option>
							<option value="wallet2">Wallet 2</option>
						</select>
						<div class="invalid-feedback">
							{t.Validation.PleaseSelectAWallet}
						</div>
					</div>
				</div>
				<div class="form-group row">
					<label for="totalbalance" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.Total + ':'}</b></label>
					<div class="col-sm-7">
						<label id="totalbalance" class="col-form-label col-form-label-sm">100 BTC</label>
					</div>
				</div>
				<div class="form-group row">
					<label for="tradablebalance" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.Tradable + ':'}</b></label>
					<div class="col-sm-7">
						<label id="tradablebalance" class="col-form-label col-form-label-sm">100 BTC</label>
					</div>
				</div>
				<div class="form-group row">
					<label for="marginrequirement" class="col-sm-5 col-form-label col-form-label-sm" title={t.Generic.MarginRequirements}><b>{t.Generic.MargReq + ':'}</b></label>
					<div class="col-sm-7">
						<label id="marginrequirement" class="col-form-label col-form-label-sm">10%</label>
					</div>
				</div>
				<div class="form-group row">
					<label for="broker" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.Broker + ':'}</b></label>
					<div class="col-sm-7">
						<select id="broker" class="form-control form-control-sm" required={true}>
							<option value="">{t.Generic.Select}</option>
							<option value="broker1">Broker 1</option>
							<option value="broker2">Broker 2</option>
						</select>
						<div class="invalid-feedback">
							{t.Validation.PleaseSelectABroker}
						</div>
					</div>
				</div>			  
				<div class="form-group row">
					<label for="asset" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.Asset + ':'}</b></label>
					<div class="col-sm-7">
						<select id="asset" class="form-control form-control-sm" required={true}>
							<option value="">{t.Generic.Select}</option>
							<option value="appl">Apple</option>
							<option value="googl">Google</option>
						</select>
						<div class="invalid-feedback">
							{t.Validation.PleaseSelectAnAsset}
						</div>						
					</div>
				</div>
				<div class="form-group row small-vert-padding">
					<div class="col-sm-12">
						<div class={buttonGroupClass + " btn-group-sm btn-group-toggle order-button-group"} data-toggle="buttons">
							<label class={"btn btn-info " + marketOrderActiveClass} onClick={this.marketOrderClick}>
								<input type="radio" name="options" id="option2" autoComplete="off" /> {t.Generic.MarketOrder}
							</label>
							<label class={"btn btn-info " + limitOrderActiveClass} onClick={this.limitOrderClick}>
								<input type="radio" name="options" id="option1" autoComplete="off" /> {t.Generic.LimitOrder}
							</label>
							<label class={"btn btn-info " + liquidityOrderActiveClass} onClick={this.liquidityOrderClick}>
								<input type="radio" name="options" id="option3" autoComplete="off" /> {t.Generic.LiquidityOrder}
							</label>
						</div>
					</div>
				</div>
				<div class="form-group row">
					<label for="amount" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.Amount + ':'}</b></label>
					<div class="col-sm-7">
						<input type="number" class="form-control form-control-sm" id="amount" required={true} min="0.01" step="0.01"/>
						<div class="invalid-feedback">
							{t.Validation.PleaseEnterAPositiveAmount}
						</div>
					</div>
				</div>
				<div class="form-group row" style={{ display: displayPrice }}>
					<label for="price" class="col-sm-5 col-form-label col-form-label-sm"><b>{priceText}</b></label>
					<div class="col-sm-7">
						<div class="input-group input-group-sm">
							<input type="number" class="form-control form-control-sm" id="price" required={true} min="0.01" step="0.01" />
							<div class="input-group-append">
								<div class="input-group-text">USD$</div>
							</div>
							<div class="invalid-feedback">
								{t.Validation.PleaseEnterAPositiveAmount}
							</div>
						</div>
					</div>
				</div>
				<div class="form-group row">
					<label for="stoploss" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.StopLoss + ':'}</b></label>
					<div class="col-sm-7">
						<select id="stoploss" class="form-control form-control-sm" value={this.state.stopLower} onChange={this.changeStopLoss}>
							<option value="none">{t.Generic.None}</option>
							<option value="market">{t.Generic.Market}</option>
							<option value="limit">{t.Generic.Limit}</option>							
						</select>
					</div>
				</div>
				<div class="form-group row" style={{ display: displayActivateStopLossAt }}>
					<label for="activatestoplossat" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.ActivateAt + ':'}</b></label>
					<div class="col-sm-7">
						<div class="input-group input-group-sm">
							<input type="number" class="form-control form-control-sm" id="activatestoplossat" required={true} min="0.01" step="0.01" />
							<div class="input-group-append">
								<div class="input-group-text">USD$</div>
							</div>
							<div class="invalid-feedback">
								{t.Validation.PleaseEnterAPositiveAmount}
							</div>
						</div>
					</div>
				</div>
				<div class="form-group row" style={{ display: displayLimitLossPrice }}>
					<label for="limitlossprice" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.LimitPrice + ':'}</b></label>
					<div class="col-sm-7">
						<div class="input-group input-group-sm">
							<input type="number" class="form-control form-control-sm" id="limitlossprice" required={true} min="0.01" step="0.01" />
							<div class="input-group-append">
								<div class="input-group-text">USD$</div>
							</div>
							<div class="invalid-feedback">
								{t.Validation.PleaseEnterAPositiveAmount}
							</div>
						</div>
					</div>
				</div>				
				<div class="form-group row order-button-container small-vert-padding">
					<div class="col-sm-6">
						<button type="submit" class="btn btn-success">{t.Generic.Buy}</button>
					</div>
					<div class="col-sm-6">
						<button type="submit" class="btn btn-danger">{t.Generic.Sell}</button>
					</div>
				</div>
			</form>
		);
	}
}