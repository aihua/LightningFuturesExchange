import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../../../../stores/i18nstore.js'

import PropTypes from 'prop-types';

export default class OrderTable extends React.Component {
	static propTypes = {
		tableType: PropTypes.string
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		const rowBackGroundColor = this.props.tableType == 'sell' ? 'table-danger' : 'table-success';

		return (
			<table class="table table-sm table-xs">
			  <thead class="thead-light">
			    <tr>
			      <th scope="col">{t.Generic.Price}</th>
			      <th scope="col">{t.Generic.Size}</th>
			      <th scope="col">{t.Generic.Total}</th>
			    </tr>
			  </thead>
			  <tbody>
			    <tr>
			      <td class={rowBackGroundColor}>8667</td>
			      <td>1,000</td>
			      <td>250,000</td>
			    </tr>
			    <tr>
			      <td class={rowBackGroundColor}>8666</td>
			      <td>1,000</td>
			      <td>250,000</td>
			    </tr>
			    <tr>
			      <td class={rowBackGroundColor}>8665</td>
			      <td>1,000</td>
			      <td>250,000</td>
			    </tr>
			    <tr>
			      <td class={rowBackGroundColor}>8664</td>
			      <td>1,000</td>
			      <td>250,000</td>
			    </tr>
			    <tr>
			      <td class={rowBackGroundColor}>8663</td>
			      <td>1,000</td>
			      <td>250,000</td>
			    </tr>			    
			  </tbody>
			</table>
		)
	}
}