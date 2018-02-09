import React from "react";
import ReactDom from "react-dom";

export default class Order extends React.Component {
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
			buttonGroupVertical: false
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
		const buttonGroupClass = this.state.buttonGroupVertical ? "btn-group-vertical" : "btn-group"

		const marketOrderActiveClass = this.state.orderType == 'market' ? 'active' : '';
		const limitOrderActiveClass = this.state.orderType == 'limit' ? 'active' : '';
		const liquidityOrderActiveClass = this.state.orderType == 'liquidity' ? 'active' : '';

		const displayPrice = (this.state.orderType == 'limit' || this.state.orderType == 'liquidity') ? 'flex' : 'none';
		const priceText = this.state.orderType == 'liquidity' ? 'Offset:' : 'Price:';

		const displayActivateStopLossAt = (this.state.stopLoss == 'market' || this.state.stopLoss == 'limit') ? 'flex' : 'none';
		const displayLimitLossPrice = (this.state.stopLoss == 'limit') ? 'flex' : 'none';

		return (
			<form id="order-form" class="needs-validation" noValidate={true} ref="form">
				<div class="form-group row">
					<label for="exchange" class="col-sm-4 col-form-label col-form-label-sm"><b>Exchange:</b></label>
					<div class="col-sm-8">
						<select id="exchange" class="form-control form-control-sm" required={true}>
							<option value="">Select</option>
							<option value="server1">Exchange 1</option>
							<option value="server2">Exchange 2</option>
						</select>
						<div class="invalid-feedback">
							Please select and exchange.
						</div>
					</div>
				</div>
				<div class="form-group row">
					<label for="wallet" class="col-sm-4 col-form-label col-form-label-sm"><b>Wallet:</b></label>
					<div class="col-sm-8">
						<select id="wallet" class="form-control form-control-sm" required={true}>
							<option value="">Select</option>
							<option value="wallet1">Wallet 1</option>
							<option value="wallet2">Wallet 2</option>
						</select>
						<div class="invalid-feedback">
							Please select a wallet.
						</div>
					</div>
				</div>
				<div class="form-group row">
					<label for="totalbalance" class="col-sm-4 col-form-label col-form-label-sm"><b>Total:</b></label>
					<div class="col-sm-8">
						<label id="totalbalance" class="col-form-label col-form-label-sm">100 BTC</label>
					</div>
				</div>
				<div class="form-group row">
					<label for="tradablebalance" class="col-sm-4 col-form-label col-form-label-sm"><b>Tradable:</b></label>
					<div class="col-sm-8">
						<label id="tradablebalance" class="col-form-label col-form-label-sm">100 BTC</label>
					</div>
				</div>
				<div class="form-group row">
					<label for="marginrequirement" class="col-sm-4 col-form-label col-form-label-sm" title="Margin Requirement"><b>Marg. Req.:</b></label>
					<div class="col-sm-8">
						<label id="marginrequirement" class="col-form-label col-form-label-sm">10%</label>
					</div>
				</div>
				<div class="form-group row">
					<label for="broker" class="col-sm-4 col-form-label col-form-label-sm"><b>Broker:</b></label>
					<div class="col-sm-8">
						<select id="broker" class="form-control form-control-sm" required={true}>
							<option value="">Select</option>
							<option value="broker1">Broker 1</option>
							<option value="broker2">Broker 2</option>
						</select>
						<div class="invalid-feedback">
							Please select a broker.
						</div>
					</div>
				</div>			  
				<div class="form-group row">
					<label for="asset" class="col-sm-4 col-form-label col-form-label-sm"><b>Asset:</b></label>
					<div class="col-sm-8">
						<select id="asset" class="form-control form-control-sm" required={true}>
							<option value="">Select</option>
							<option value="appl">Apple</option>
							<option value="googl">Google</option>
						</select>
						<div class="invalid-feedback">
							Please select an asset.
						</div>						
					</div>
				</div>
				<div class="form-group row small-vert-padding">
					<div class="col-sm-12">
						<div class={buttonGroupClass + " btn-group-sm btn-group-toggle order-button-group"} data-toggle="buttons">
							<label class={"btn btn-info " + marketOrderActiveClass} onClick={this.marketOrderClick}>
								<input type="radio" name="options" id="option2" autoComplete="off" /> Market Order
							</label>
							<label class={"btn btn-info " + limitOrderActiveClass} onClick={this.limitOrderClick}>
								<input type="radio" name="options" id="option1" autoComplete="off" /> Limit Order
							</label>
							<label class={"btn btn-info " + liquidityOrderActiveClass} onClick={this.liquidityOrderClick}>
								<input type="radio" name="options" id="option3" autoComplete="off" /> Liquidity Order
							</label>
						</div>
					</div>
				</div>
				<div class="form-group row">
					<label for="amount" class="col-sm-4 col-form-label col-form-label-sm"><b>Amount:</b></label>
					<div class="col-sm-8">
						<input type="text" class="form-control form-control-sm" id="amount" placeholder="" />
					</div>
				</div>
				<div class="form-group row" style={{ display: displayPrice }}>
					<label for="price" class="col-sm-4 col-form-label col-form-label-sm"><b>{priceText}</b></label>
					<div class="col-sm-8">
						<div class="input-group input-group-sm">
							<input type="text" class="form-control form-control-sm" id="price" placeholder="" />
							<div class="input-group-append">
								<div class="input-group-text">USD$</div>
							</div>
						</div>
					</div>
				</div>
				<div class="form-group row">
					<label for="stoploss" class="col-sm-4 col-form-label col-form-label-sm"><b>Stop Loss:</b></label>
					<div class="col-sm-8">
						<select id="stoploss" class="form-control form-control-sm" value={this.state.stopLower} onChange={this.changeStopLoss}>
							<option value="none">None</option>
							<option value="market">Market</option>
							<option value="limit">Limit</option>							
						</select>
					</div>
				</div>
				<div class="form-group row" style={{ display: displayActivateStopLossAt }}>
					<label for="activatestoplossat" class="col-sm-4 col-form-label col-form-label-sm"><b>Activate At:</b></label>
					<div class="col-sm-8">
						<div class="input-group input-group-sm">
							<input type="text" class="form-control form-control-sm" id="activatestoplossat" placeholder="" />
							<div class="input-group-append">
								<div class="input-group-text">USD$</div>
							</div>
						</div>
					</div>
				</div>
				<div class="form-group row" style={{ display: displayLimitLossPrice }}>
					<label for="limitlossprice" class="col-sm-4 col-form-label col-form-label-sm"><b>Limit Price:</b></label>
					<div class="col-sm-8">
						<div class="input-group input-group-sm">
							<input type="text" class="form-control form-control-sm" id="limitlossprice" placeholder="" />
							<div class="input-group-append">
								<div class="input-group-text">USD$</div>
							</div>
						</div>
					</div>
				</div>				
				<div class="form-group row order-button-container small-vert-padding">
					<div class="col-sm-6">
						<button type="submit" class="btn btn-success">Buy</button>
					</div>
					<div class="col-sm-6">
						<button type="submit" class="btn btn-danger">Sell</button>
					</div>
				</div>
			</form>
		);
	}
}