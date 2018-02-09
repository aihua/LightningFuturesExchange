import React from "react";
import ReactDom from "react-dom";

import LanguageSelect from "./languageselector/languageselector.js"

import I18nStore from '../../../stores/i18nstore.js';

export default class Header extends React.Component {
	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		return (
			<nav id="header" class="navbar navbar-expand-lg navbar-dark bg-dark">
			  <a class="navbar-brand" href="#" title={t.Generic.LightningFuturesExchange}>LFE</a>
			  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
			    <span class="navbar-toggler-icon"></span>
			  </button>

			  <div class="collapse navbar-collapse" id="navbarSupportedContent">
			    <ul class="navbar-nav ml-auto">
				  <LanguageSelect /> 
			      <li class="nav-item dropdown">
			        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			          {t.Generic.Manage}
			        </a>
			        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
			          <a class="dropdown-item" href="#">{t.Generic.Exchanges}</a>
			          <a class="dropdown-item" href="#">{t.Generic.Wallets}</a>
			        </div>
			      </li>
			    </ul>
			  </div>
			</nav>
		);
	}
}