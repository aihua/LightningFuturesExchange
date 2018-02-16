import { EventEmitter } from "events";
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

		this.saveConfigStatus = 'idle';
		this.saveConfigError = '';
	}
	
	handleActions(action) {
		switch(action.type) {
			case "MANAGE_EXCHANGE_AND_WALLETS_CLICKED": {
				this.emit('manageExchangeAndWalletsClicked');
				break;
			}

			case "NO_CONFIG": {
				this.configExists = false;
				this.requiresCreatePassword = true;
				this.requiresLogin = false;
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
				this.requiresLogin = false;

				if (!action.data.hasConfig) {
					this.configExists = false;
					this.requiresCreatePassword = true;
					this.requiresLogin = false;
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

			//Create Config
			case "SAVING_CONFIG": {
				this.saveConfigStatus = 'fetching'
				this.saveConfigError = ''
				this.emit('changedSaveConfigStatus');
				break;
			}
			case "SAVED_CONFIG": {
				this.configExists = true;
				this.config = action.data;

				this.saveConfigError = '';
				this.saveConfigStatus = 'fetched';
				this.emit('changedSaveConfigStatus');
				this.saveConfigStatus = 'idle'
				this.emit('changedSaveConfigStatus');
				this.emit('changedConfig');
				break;
			}
			case "ERROR_SAVING_CONFIG": {
				this.saveConfigError = action.data;
				this.saveConfigStatus = 'error'
				this.emit('changedSaveConfigStatus');
				this.saveConfigStatus = 'idle'
				this.emit('changedSaveConfigStatus');
				break;
			}
		}
	}
}

const configStore = new ConfigStore;
dispatcher.register(configStore.handleActions.bind(configStore));

ConfigActions.exists();

export default configStore;