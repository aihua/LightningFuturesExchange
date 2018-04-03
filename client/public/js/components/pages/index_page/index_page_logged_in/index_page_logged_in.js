import React from "react";
import ReactDom from "react-dom";

import OrderForm from "./orderform/orderform.js"
import OrderBook from "./orderbook/orderbook.js"
import RecentTrades from "./recenttrades/recenttrades.js"

export default class IndexPageLoggedIn extends React.Component {
	render() {
		return (
			<div class="container-fluid">
			  <div class="row">
			    <div class="col-md-2">
			      <OrderForm />
			    </div>
			    <div class="col-md-10">
			    	<div class="row">
						<div class="col-md-2">
							<OrderBook />
						</div>
						<div class="col-md-2">
							<RecentTrades />
						</div>
						<div class="col-md-4">
						</div>
			    	</div>
			    </div>
			  </div>
			</div>
		);
	}
}