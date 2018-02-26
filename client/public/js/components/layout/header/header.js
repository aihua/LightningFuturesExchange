import React from "react";
import ReactDom from "react-dom";
import { Link } from "react-router-dom";

import LanguageSelect from "./languageselector/languageselector.js"

import I18nStore from '../../../stores/i18nstore.js';
import LoginStore from '../../../stores/loginstore.js'
import * as LoginActions from  '../../../actions/loginactions.js'

export default class Header extends React.Component {
	componentWillMount() {
		LoginStore.on('changedLoggedInState', this._forceUpdate);
		LoginStore.on('updatedUser', this._forceUpdate);
	}

	componentWillUnmount() {
		LoginStore.removeListener('changedLoggedInState', this._forceUpdate);
		LoginStore.removeListener('updatedUser', this._forceUpdate);		
	}

	_forceUpdate = () => {
		this.forceUpdate();
	}

	logoutClicked = () => {
		LoginActions.logout();
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		let menuItems = []
		if (LoginStore.loggedInState === 'loggedin') {
			menuItems = [
				(<li key="username" class="nav-item">
					<span class="navbar-text">
						{LoginStore.user.username + ' 100BTC '}
					</span>
				</li>),
				(<li key="account" class="nav-item dropdown">
					<a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						{t.Generic.Account}
					</a>
					<div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
						<Link class="dropdown-item" to={'/change_username'} role="button">
							{t.Generic.ChangeUsername}
						</Link>
						<Link class="dropdown-item" to={'/change_email'} role="button">
							{t.Generic.ChangeEmail}
						</Link>
						<a class="dropdown-item" href="#">{t.Generic.TransactionHistory}</a>
						<div class="dropdown-divider"></div>
						<Link class="dropdown-item" to={'/'} role="button" onClick={this.logoutClicked}>
							{t.Generic.Logout}
						</Link>
					</div>
				</li>)
			]
		} else if (LoginStore.loggedInState === 'loggedout') {
			menuItems = [
				(<li key="username" class="nav-item">
					<Link class="nav-link" to={'/register'} role="button">
						{t.Generic.Register}
					</Link>
				</li>),
				(<li key="logout" class="nav-item">
					<Link class="nav-link" to={'/login'} role="button">
						{t.Generic.Login}
					</Link>
				</li>)
			]
		}

		return (
			<nav id="header" class="navbar navbar-expand-sm navbar-dark bg-dark">
			  <Link class="navbar-brand" to={'/'} title={t.Generic.LightningFuturesExchange}>LFE</Link>
			  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
			    <span class="navbar-toggler-icon"></span>
			  </button>

			  <div class="collapse navbar-collapse" id="navbarSupportedContent">
			    <ul class="navbar-nav ml-auto">
				  <LanguageSelect /> 
			      {menuItems}
			    </ul>
			  </div>
			</nav>
		);
	}
}