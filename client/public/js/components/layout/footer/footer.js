import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js';

export default class Footer extends React.Component {
	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		return (
			<footer id="footer" class="py-5 bg-dark">
				<div class="container">
					<p class="m-0 text-center text-white">
						{t.Generic.Copyright}
					</p>
				</div>
			</footer>
		);
	}
}