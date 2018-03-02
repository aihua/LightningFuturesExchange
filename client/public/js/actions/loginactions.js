import dispatcher from '../dispatchers/dispatcher.js'
import axios from 'axios'


export function changeLoggedInState(status) {
	dispatcher.dispatch({type: 'CHANGE_LOGGED_IN_STATE', data: status});
}

export function updateUser(user) {
	dispatcher.dispatch({type: 'UPDATE_USER', data: user});
}

export function open2FADialog() {
	dispatcher.dispatch({type: 'OPEN_2FA_DIALOG'});
}

export function login(username, password, twofaToken) {
	dispatcher.dispatch({type: 'LOGGING_IN'})

	axios.post('/api/login', { username: username, password: password, token: twofaToken})
		.then(res => {
			dispatcher.dispatch({type: 'LOGGED_IN', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_LOGGING_IN', data: error.response.data})
		});	
}

export function logout() {
	dispatcher.dispatch({type: 'LOGGING_OUT'})

	axios.post('/api/logout', {})
		.then(res => {
			dispatcher.dispatch({type: 'LOGGED_OUT', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_LOGGING_OUT', data: error.response.data})
		});	
}

export function checkSession() {
	dispatcher.dispatch({type: 'CHECKING_SESSION'})

	axios.post('/api/check_session', {})
		.then(res => {
			dispatcher.dispatch({type: 'CHECKED_SESSION', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CHECKING_SESSION', data: error.response.data})
		});	
}

export function getTwoFactorToken() {
	dispatcher.dispatch({type: 'GETTING_TWO_FACTOR_TOKEN'})

	axios.post('/api/get_two_factor_token', {})
		.then(res => {
			dispatcher.dispatch({type: 'GOT_TWO_FACTOR_TOKEN', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_GETTING_TWO_FACTOR_TOKEN', data: error.response.data})
		});
}

export function enableTwoFactorAuthentication(token) {
	dispatcher.dispatch({type: 'ENABLING_TWO_FACTOR_AUTHENTICATION'})

	axios.post('/api/enable_two_factor_authentication', {token: token})
		.then(res => {
			dispatcher.dispatch({type: 'ENABLED_TWO_FACTOR_AUTHENTICATION', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_ENABLING_TWO_FACTOR_AUTHENTICATION', data: error.response.data})
		});
}

export function disableTwoFactorAuthentication(token) {
	dispatcher.dispatch({type: 'DISABLING_TWO_FACTOR_AUTHENTICATION'})

	axios.post('/api/disable_two_factor_authentication', {token: token})
		.then(res => {
			dispatcher.dispatch({type: 'DISABLED_TWO_FACTOR_AUTHENTICATION', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_DISABLING_TWO_FACTOR_AUTHENTICATION', data: error.response.data})
		});
}