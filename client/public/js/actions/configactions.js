import dispatcher from '../dispatchers/dispatcher.js';
import axios from 'axios';

export function manageExchangeAndWalletsClicked() {
	dispatcher.dispatch({type: 'MANAGE_EXCHANGE_AND_WALLETS_CLICKED'});
}

export function setNoConfig() {
	dispatcher.dispatch({type: 'NO_CONFIG'});
}

export function setIncorrectPassword() {
	dispatcher.dispatch({type: 'INCORRECT_PASSWORD'});
}

export function configExists() {
	dispatcher.dispatch({type: 'CONFIG_EXISTS'});
}

export function exists() {
	dispatcher.dispatch({type: 'FETCHING_CONFIG_EXISTS'})

	axios.get('/api/config/exists')
		.then(res => {
			dispatcher.dispatch({type: 'FETCHED_CONFIG_EXISTS', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_FETCHING_CONFIG_EXISTS', data: error.response.data})
		});
}

export function getConfig() {
	dispatcher.dispatch({type: 'FETCHING_CONFIG'})

	axios.get('/api/config')
		.then(res => {
			dispatcher.dispatch({type: 'FETCHED_CONFIG', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_FETCHING_CONFIG', data: error.response.data})
		});
}

export function login(password) {
	dispatcher.dispatch({type: 'LOGGING_IN'})

	axios.post('/api/password', { password: password })
		.then(res => {
			dispatcher.dispatch({type: 'LOGGED_IN', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_LOGGING_IN', data: error.response.data})
		});
}

export function createConfig(password) {
	dispatcher.dispatch({type: 'CREATING_CONFIG'})

	axios.post('/api/config', { password: password })
		.then(res => {
			dispatcher.dispatch({type: 'CREATED_CONFIG', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CREATING_CONFIG', data: error.response.data})
		});
}

export function saveConfig(config) {
	dispatcher.dispatch({type: 'SAVING_CONFIG'})

	axios.put('/api/config', config)
		.then(res => {
			dispatcher.dispatch({type: 'SAVED_CONFIG', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_SAVING_CONFIG', data: error.response.data})
		});
}