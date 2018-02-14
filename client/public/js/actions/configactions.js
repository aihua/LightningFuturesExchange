import dispatcher from '../dispatchers/dispatcher.js';
import axios from 'axios';

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

export function addExchange(newExchange) {
	dispatcher.dispatch({type: 'ADDING_EXCHANGE'});

	axios.post('/api/config/exchange', newExchange)
		.then(res => {
			dispatcher.dispatch({type: 'ADDED_EXCHANGE', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_ADDING_EXCHANGE', data: error.response.data})
		});
}

export function removeExchange(oldExchange) {
	dispatcher.dispatch({type: 'REMOVING_EXCHANGE'});

	axios.delete('/api/config/exchange/' + escape(oldExchange.name))
		.then(res => {
			dispatcher.dispatch({type: 'REMOVED_EXCHANGE', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_REMOVING_EXCHANGE', data: error.response.data})
		});
}

export function renameExchange(oldExchange, newExchange) {
	dispatcher.dispatch({type: 'RENAMING_EXCHANGE'});

	axios.put('/api/config/exchange/' + escape(oldExchange.name), newExchange)
		.then(res => {
			dispatcher.dispatch({type: 'RENAMED_EXCHANGE', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_RENAMING_EXCHANGE', data: error.response.data})
		});
}

export function addWallet(exchange, newWallet) {
	dispatcher.dispatch({type: 'ADDING_WALLET'});

	axios.post('/api/config/exchange/' + escape(exchange.name) + '/wallet', newWallet)
		.then(res => {
			dispatcher.dispatch({type: 'ADDED_WALLET', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_ADDING_WALLET', data: error.response.data})
		});
}

export function removeWallet(exchange, oldWallet) {
	dispatcher.dispatch({type: 'REMOVING_WALLET'});

	axios.delete('/api/config/exchange/' + escape(exchange.name) + '/wallet/' + escape(oldWallet.name))
		.then(res => {
			dispatcher.dispatch({type: 'REMOVED_WALLET', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_REMOVING_WALLET', data: error.response.data})
		});
}

export function renameWallet(exchange, oldWallet, newWallet) {
	dispatcher.dispatch({type: 'RENAMING_WALLET'});

	axios.put('/api/config/exchange/' + escape(exchange.name) + '/wallet/' + escape(oldWallet.name), newWallet)
		.then(res => {
			dispatcher.dispatch({type: 'RENAMED_WALLET', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_RENAMING_WALLET', data: error.response.data})
		});
}