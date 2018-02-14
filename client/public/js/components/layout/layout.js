import React from "react";
import ReactDom from "react-dom";

import Header from "./header/header.js"
import Footer from "./footer/footer.js"

import Main from "../main/main.js"

import I18nStore from '../../stores/i18nstore.js'
import ConfigStore from '../../stores/configstore.js'

import CreateConfigDialog from './dialogs/createconfigdialog/createconfigdialog.js';
import LoginDialog from './dialogs/logindialog/logindialog.js';
import ManageWalletsDialog from './dialogs/managewalletsdialog/managewalletsdialog.js';
import ManageExchangesDialog from './dialogs/manageexchangesdialog/manageexchangesdialog.js';

export default class Layout extends React.Component {
	componentWillMount() {
		I18nStore.on('changeLanguage', this._forceUpdate);
		ConfigStore.on('changedFetchConfigExistsStatus', this.changedFetchConfigExistsStatus)
	}

	componentWillUnmount() {
		I18nStore.unbindListener('changeLanguage', this._forceUpdate)
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
		if (I18nStore.getCurrentLanguageJSON()) {
			return (
					<div>
					<Header/>
					<Main />
					<Footer/>
					<CreateConfigDialog />
					<LoginDialog />
					<ManageWalletsDialog />
					<ManageExchangesDialog />
				</div>
			);
		} else {
			return (<div></div>);
		}
	}
}