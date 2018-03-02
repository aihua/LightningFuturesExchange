import React from "react";
import ReactDom from "react-dom";

import Header from "./header/header.js"
import Footer from "./footer/footer.js"

import Main from "../main/main.js"

import I18nStore from '../../stores/i18nstore.js'
import LoginStore from '../../stores/i18nstore.js'

import ConfirmDialog from '../dialogs/confirmdialog.js';
import TwoFactorAuthenticationDialog from '../pages/two_factor_authentication_page/two_factor_authentication_dialog/two_factor_authentication_dialog.js'

export default class Layout extends React.Component {
	componentWillMount() {
		I18nStore.on('changeLanguage', this._forceUpdate);
		LoginStore.on('changedLoggedInState', this._forceUpdate);
	}

	componentWillUnmount() {
		I18nStore.unbindListener('changeLanguage', this._forceUpdate)
		LoginStore.unbindListener('changedLoggedInState', this._forceUpdate)
	}

	changedFetchConfigExistsStatus = () => {
		if (ConfigStore.fetchConfigExistsStatus === 'fetched') {
			this.forceUpdate();
		}
	}

	_forceUpdate = () => {
		this.forceUpdate();
	}

	render() {
		if (I18nStore.getCurrentLanguageJSON() && LoginStore.loggedInState !== 'unknown') {
			return (
				<div id="wrap">
					<div id="wrap-main">
						<Header />
						<Main />
						<ConfirmDialog />
						<TwoFactorAuthenticationDialog />
					</div>
					<Footer/>
				</div>
			);
		} else {
			return (<div></div>);
		}
	}
}