import dispatcher from '../dispatchers/dispatcher.js'
import axios from 'axios'


export function changeLoggedInState(status) {
	dispatcher.dispatch({type: 'CHANGE_LOGGED_IN_STATE', data: status})
}

export function updateUser(user) {
	dispatcher.dispatch({type: 'UPDATE_USER', data: user})
}

export function login(username, password, twofaToken) {
	dispatcher.dispatch({type: 'LOGGING_IN'})

	axios.post('/api/login', { username: username, password: password, twofaToken: twofaToken})
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