import React from "react";
import ReactDom from "react-dom";

import Order from "./order/order"

export default class IndexPage extends React.Component {
	render() {
		return (
			<div class="container-fluid">
			  <div class="row">
			    <div class="col-md-3">
			      <Order />
			    </div>
			    <div class="col-md-9">
			      One of three columns
			    </div>
			  </div>
			</div>
		);
	}
}