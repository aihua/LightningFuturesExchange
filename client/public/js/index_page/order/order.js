import React from "react";
import ReactDom from "react-dom";

export default class Order extends React.Component {
	render() {
		return (
			<form id="order-form" class="well">
			  <div class="form-group row">
			    <label for="exchange" class="col-sm-3 col-form-label col-form-label-sm">Exchange</label>
			    <div class="col-sm-9">
					<select id="exchange" class="form-control form-control-sm">
					  <option value="server1">Exchange 1</option>
					  <option value="server2">Exchange 2</option>
					</select>
			    </div>
			  </div>
			  <div class="form-group row">
			    <label for="wallet" class="col-sm-3 col-form-label col-form-label-sm">Wallet</label>
			    <div class="col-sm-9">
					<select id="wallet" class="form-control form-control-sm">
					  <option value="wallet1">Wallet 1</option>
					  <option value="wallet2">Wallet 2</option>
					</select>
			    </div>
			  </div>
			  <div class="form-group row">
			    <label for="totalbalance" class="col-sm-7 col-form-label col-form-label-sm">Total Balance:</label>
			    <div class="col-sm-5">
				    <label id="totalbalance" class="col-form-label col-form-label-sm">100 BTC</label>
			    </div>
			  </div>
			  <div class="form-group row">
			    <label for="tradablebalance" class="col-sm-7 col-form-label col-form-label-sm">Tradable Balance:</label>
			    <div class="col-sm-5">
				    <label id="tradablebalance" class="col-form-label col-form-label-sm">100 BTC</label>
			    </div>
			  </div>
			  <div class="form-group row">
			    <label for="marginrequirement" class="col-sm-7 col-form-label col-form-label-sm">Margin Requirement: </label>
			    <div class="col-sm-5">
				    <label id="marginrequirement" class="col-form-label col-form-label-sm">10%</label>
			    </div>
			  </div>
			  <div class="form-group row">
			    <label for="broker" class="col-sm-3 col-form-label col-form-label-sm">Broker</label>
			    <div class="col-sm-9">
					<select id="wallet" class="form-control form-control-sm">
					  <option value="broker1">Broker 1</option>
					  <option value="broker2">Broker 2</option>
					</select>
			    </div>
			  </div>			  
			  <div class="form-group row">
			    <label for="broker" class="col-sm-3 col-form-label col-form-label-sm">Asset</label>
			    <div class="col-sm-9">
					<select id="wallet" class="form-control form-control-sm">
					  <option value="appl">Apple</option>
					  <option value="googl">Google</option>
					</select>
			    </div>
			  </div>
			  <div class="form-group row">
			    <div class="col-sm-12">
					<div class="btn-group btn-group-sm btn-group-toggle" data-toggle="buttons">
					  <label class="btn btn-info active">
					    <input type="radio" name="options" id="option1" autocomplete="off" checked={true} /> Limit Order
					  </label>
					  <label class="btn btn-info">
					    <input type="radio" name="options" id="option2" autocomplete="off" /> Market Order
					  </label>
					  <label class="btn btn-info">
					    <input type="radio" name="options" id="option3" autocomplete="off" /> Liquidity Order
					  </label>
					</div>
			    </div>
			  </div>			  
			  <div class="form-group row order-button-container">
			    <div class="col-sm-6">
			      <button type="button" class="btn btn-success">Buy</button>
			    </div>
			    <div class="col-sm-6">
			      <button type="button" class="btn btn-danger">Sell</button>
			    </div>
			  </div>
			</form>
		);
	}
}