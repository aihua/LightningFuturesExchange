import React from "react";
import ReactDom from "react-dom";

import OrderTable from "./ordertable/ordertable.js"

import I18nStore from '../../../../../stores/i18nstore.js'

export default class OrderBook extends React.Component {
	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		return (
			<div>
				<h5>{t.Generic.OrderBook}</h5>
				<OrderTable tableType="sell" />
				<OrderTable tableType="buy" />				
			</div>
		)
	}
}