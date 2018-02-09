import React from "react";
import ReactDom from "react-dom";

import OrderForm from "./orderform/orderform"

export default class IndexPage extends React.Component {
	render() {
		return (
			<div class="container-fluid">
			  <div class="row">
			    <div class="col-md-2">
			      <OrderForm />
			    </div>
			    <div class="col-md-10">
			      One of three columns
			    </div>
			  </div>
			</div>
		);
	}
}