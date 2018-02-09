import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

export default class RecentTrades extends React.Component {
	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		return (
			<div>
				<h5>{t.Generic.RecentTrades}</h5>
				<table class="table table-sm table-xs">
				  <tbody>
				    <tr>
				      <td>8667</td>
				      <td>1,000</td>
				      <td>14:00:05</td>
				    </tr>
				    <tr>
				      <td>8667</td>
				      <td>1,000</td>
				      <td>14:00:05</td>
				    </tr>
				    <tr>
				      <td>8667</td>
				      <td>1,000</td>
				      <td>14:00:05</td>
				    </tr>
				    <tr>
				      <td>8667</td>
				      <td>1,000</td>
				      <td>14:00:05</td>
				    </tr>
				    <tr>
				      <td>8667</td>
				      <td>1,000</td>
				      <td>14:00:05</td>
				    </tr>
				    <tr>
				      <td>8667</td>
				      <td>1,000</td>
				      <td>14:00:05</td>
				    </tr>
				    <tr>
				      <td>8667</td>
				      <td>1,000</td>
				      <td>14:00:05</td>
				    </tr>
				    <tr>
				      <td>8667</td>
				      <td>1,000</td>
				      <td>14:00:05</td>
				    </tr>
				    <tr>
				      <td>8667</td>
				      <td>1,000</td>
				      <td>14:00:05</td>
				    </tr>
				    <tr>
				      <td>8667</td>
				      <td>1,000</td>
				      <td>14:00:05</td>
				    </tr>	
				  </tbody>
				</table>
			</div>
		)
	}
}