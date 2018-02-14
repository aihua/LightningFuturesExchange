import { EventEmitter } from "events";
import Languages from "../../translations/languages.js"
import dispatcher from '../dispatchers/dispatcher.js'
import cookie from 'react-cookies'
import _ from 'underscore'

import * as ConfigActions from  '../actions/configactions.js'

class ConfigStore extends EventEmitter {
	constructor() {
		super()

		this.config = null;
		this.configExists = false;
		this.requiresCreatePassword = false;
		this.requiresLogin = false;

		this.fetchConfigExistsStatus = 'idle';
		this.fetchConfigExistsError = '';

		this.fetchConfigStatus = 'idle';
		this.fetchConfigError = '';

		this.loginStatus = 'idle';
		this.loginError = '';

		this.createConfigStatus = 'idle';
		this.createConfigError = '';

		this.addExchangeStatus = 'idle';
		this.addExchangeError = '';

		this.removeExchangeStatus = 'idle';
		this.removeExchangeError = '';

		this.renameExchangeStatus = 'idle';
		this.renameExchangeError = '';

		this.addWalletStatus = 'idle';
		this.addWalletError = '';

		this.removeWalletStatus = 'idle';
		this.removeWalletError = '';

		this.renameWalletStatus = 'idle';
		this.renameWalletError = '';
	}
	
	handleActions(action) {
		switch(action.type) {
			case "NO_CONFIG": {
				this.configExists = false;
				this.requiresCreatePassword = true;
				this.requiesLogin = false;
				cookie.remove('sessiontoken');
				this.emit('changedConfigPocession');
				break;
			}
			case "INCORRECT_PASSWORD": {
				this.configExists = true;
				this.requiresCreatePassword = false;
				this.requiresLogin = true;
				cookie.remove('sessiontoken');
				this.emit('changedConfigPocession');
				break;
			}
			case "CONFIG_EXISTS": {
				this.configExists = true;
				this.requiresCreatePassword = false;
				this.requiresLogin = true;
				cookie.remove('sessiontoken');
				this.emit('changedConfigPocession');
				break;
			}
			
			//Fetch Config Exists
			case "FETCHING_CONFIG_EXISTS": {
				this.fetchConfigExistsStatus = 'fetching'
				this.emit('changedFetchConfigExistsStatus');
				break;
			}
			case "FETCHED_CONFIG_EXISTS": {
				this.configExists = true;
				this.requiresCreatePassword = false;
				this.requiesLogin = false;

				if (!action.data.hasConfig) {
					this.configExists = false;
					this.requiresCreatePassword = true;
					this.requiesLogin = false;
				}
				this.config = action.data.config;
				this.emit('changedConfigPocession');
				this.fetchConfigExistsStatus = 'fetched'
				this.emit('changedFetchConfigExistsStatus');
				this.fetchConfigExistsStatus = 'idle'
				this.emit('changedFetchConfigExistsStatus');
				this.emit('changedConfig');
				break;
			}
			case "ERROR_FETCHING_CONFIG_EXISTS": {
				this.fetchConfigExistsError = action.data;
				this.fetchConfigExistsStatus = 'error'
				this.emit('changedFetchConfigExistsStatus');
				this.fetchConfigExistsStatus = 'idle'
				this.emit('changedFetchConfigExistsStatus');
				break;
			}

			//Fetch Config
			case "FETCHING_CONFIG": {
				this.fetchConfigStatus = 'fetching'
				this.emit('changedFetchConfigStatus');
				break;
			}
			case "FETCHED_CONFIG": {
				this.configExists = true;
				this.config = action.data;

				this.fetchConfigStatus = 'fetched'
				this.emit('changedFetchConfigStatus');
				this.fetchConfigStatus = 'idle'
				this.emit('changedFetchConfigStatus');
				this.emit('changedConfig');
				break;
			}
			case "ERROR_FETCHING_CONFIG": {
				this.fetchConfigError = action.data;
				this.fetchConfigStatus = 'error'
				this.emit('changedFetchConfigStatus');
				this.fetchConfigStatus = 'idle'
				this.emit('changedFetchConfigStatus');
				break;
			}

			//login
			case "LOGGING_IN": {
				this.loginStatus = 'fetching';
				this.loginError = '';
				this.emit('changedLoginStatus');
				break;
			}
			case "LOGGED_IN": {
				this.configExists = true;
				this.config = action.data.config;

				cookie.save('sessiontoken', action.data.sessionToken, { path: '/', maxAge: 3600 })

				this.requiresLogin = false;
				this.requiresCreatePassword = false;
				this.emit('changedConfigPocession');

				this.loginStatus = 'fetched'
				this.emit('changedLoginStatus');
				this.loginStatus = 'idle'
				this.emit('changedLoginStatus');
				this.emit('changedConfig');
				break;
			}
			case "ERROR_LOGGING_IN": {
				this.loginError = action.data;
				this.loginStatus = 'error'
				this.emit('changedLoginStatus');
				this.loginStatus = 'idle'
				this.emit('changedLoginStatus');
				break;
			}

			//Create Config
			case "CREATING_CONFIG": {
				this.createConfigStatus = 'fetching'
				this.emit('changedCreateConfigStatus');
				break;
			}
			case "CREATED_CONFIG": {
				this.configExists = true;
				this.config = action.data.config;

				cookie.save('sessiontoken', action.data.sessionToken, { path: '/', maxAge: 3600 })

				this.requiresLogin = false;
				this.requiresCreatePassword = false;
				this.emit('changedConfigPocession');

				this.createConfigStatus = 'fetched'
				this.emit('changedCreateConfigStatus');
				this.createConfigStatus = 'idle'
				this.emit('changedCreateConfigStatus');
				this.emit('changedConfig');
				break;
			}
			case "ERROR_CREATING_CONFIG": {
				this.createConfigError = action.data;
				this.createConfigStatus = 'error'
				this.emit('changedCreateConfigStatus');
				this.createConfigStatus = 'idle'
				this.emit('changedCreateConfigStatus');
				break;
			}

			//Add Exchange
			case "ADDING_EXCHANGE": {
				this.addExchangeStatus = 'fetching'
				this.emit('changedAddExchangeStatus');
				break;
			}
			case "ADDED_EXCHANGE": {
				this.configExists = true;
				this.config = action.data.config;

				this.addExchangeStatus = 'fetched'
				this.emit('changedAddExchangeStatus');
				this.addExchangeStatus = 'idle'
				this.emit('changedAddExchangeStatus');
				this.emit('changedConfig');
				break;
			}
			case "ERROR_ADDING_EXCHANGE": {
				this.addExchangeError = action.data;				
				this.addExchangeStatus = 'error'
				this.emit('changedAddExchangeStatus');
				this.addExchangeStatus = 'idle'
				this.emit('changedAddExchangeStatus');
				break;
			}

			//Remove Exchange
			case "REMOVING_EXCHANGE": {
				this.removeExchangeStatus = 'fetching'
				this.emit('changedRemoveExchangeStatus');
				break;
			}
			case "REMOVED_EXCHANGE": {
				this.configExists = true;
				this.config = action.data;

				this.removeExchangeStatus = 'fetched'
				this.emit('changedRemoveExchangeStatus');
				this.removeExchangeStatus = 'idle'
				this.emit('changedRemoveExchangeStatus');
				this.emit('changedConfig');
				break;
			}
			case "ERROR_REMOVING_EXCHANGE": {
				this.removeExchangeError = action.data;
				this.removeExchangeStatus = 'error'
				this.emit('changedRemoveExchangeStatus');
				this.removeExchangeStatus = 'idle'
				this.emit('changedRemoveExchangeStatus');
				break;
			}

			//Rename Exchange
			case "RENAMING_EXCHANGE": {
				this.renameExchangeStatus = 'fetching'
				this.emit('changedRenameExchangeStatus');
				break;
			}
			case "RENAMED_EXCHANGE": {
				this.configExists = true;
				this.config = action.data;

				this.renameExchangeStatus = 'fetched'
				this.emit('changedRenameExchangeStatus');
				this.renameExchangeStatus = 'idle'
				this.emit('changedRenameExchangeStatus');
				this.emit('changedConfig');
				break;
			}
			case "ERROR_RENAMING_EXCHANGE": {
				this.renameExchangeError = action.data;
				this.renameExchangeStatus = 'error'
				this.emit('changedRenameExchangeStatus');
				this.renameExchangeStatus = 'idle'
				this.emit('changedRenameExchangeStatus');
				break;
			}

			//Add Wallet
			case "ADDING_WALLET": {
				this.addWalletStatus = 'fetching'
				this.emit('changedAddWalletStatus');
				break;
			}
			case "ADDED_WALLET": {
				this.configExists = true;
				this.config = action.data;

				this.addWalletStatus = 'fetched'
				this.emit('changedAddWalletStatus');
				this.addWalletStatus = 'idle'
				this.emit('changedAddWalletStatus');
				this.emit('changedConfig');
				break;
			}
			case "ERROR_ADDING_WALLET": {
				this.addWalletError = action.data;				
				this.addWalletStatus = 'error'
				this.emit('changedAddWalletStatus');
				this.addWalletStatus = 'idle'
				this.emit('changedAddWalletStatus');
				break;
			}

			//Remove Wallet
			case "REMOVING_WALLET": {
				this.removeWalletStatus = 'fetching'
				this.emit('changedRemoveWalletStatus');
				break;
			}
			case "REMOVED_WALLET": {
				this.configExists = true;
				this.config = action.data;

				this.removeWalletStatus = 'fetched'
				this.emit('changedRemoveWalletStatus');
				this.removeWalletStatus = 'idle'
				this.emit('changedRemoveWalletStatus');
				this.emit('changedConfig');
				break;
			}
			case "ERROR_REMOVING_WALLET": {
				this.removeWalletError = action.data;
				this.removeWalletStatus = 'error'
				this.emit('changedRemoveWalletStatus');
				this.removeWalletStatus = 'idle'
				this.emit('changedRemoveWalletStatus');
				break;
			}

			//Rename Wallet
			case "RENAMING_WALLET": {
				this.renameWalletStatus = 'fetching'
				this.emit('changedRenameWalletStatus');
				break;
			}
			case "RENAMED_WALLET": {
				this.configExists = true;
				this.config = action.data;

				this.renameWalletStatus = 'fetched'
				this.emit('changedRenameWalletStatus');
				this.renameWalletStatus = 'idle'
				this.emit('changedRenameWalletStatus');
				this.emit('changedConfig');
				break;
			}
			case "ERROR_RENAMING_WALLET": {
				this.renameWalletError = action.data;	
				this.renameWalletStatus = 'error'
				this.emit('changedRenameWalletStatus');
				this.renameWalletStatus = 'idle'
				this.emit('changedRenameWalletStatus');
				break;
			}			
		}
	}
}

const configStore = new ConfigStore;
dispatcher.register(configStore.handleActions.bind(configStore));

ConfigActions.exists();

export default configStore;