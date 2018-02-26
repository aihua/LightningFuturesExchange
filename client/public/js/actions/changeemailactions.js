import dispatcher from '../dispatchers/dispatcher.js'
import axios from 'axios'


export function changeEmail(newEmail, password, twofa) {
	dispatcher.dispatch({type: 'CHANGING_EMAIL'})

	axios.post('/api/change_email', { newEmail: newEmail, password: password, twofa: twofa })
		.then(res => {
			dispatcher.dispatch({type: 'CHANGED_EMAIL', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CHANGING_EMAIL', data: error.response.data})
		});	
}

export function checkChangeEmail(userId, changeEmailToken) {
	dispatcher.dispatch({type: 'CHECKING_CHANGE_EMAIL'})

	axios.post('/api/check_change_email', { userId: userId, changeEmailToken: changeEmailToken })
		.then(res => {
			dispatcher.dispatch({type: 'CHECKED_CHANGE_EMAIL', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CHECKING_CHANGE_EMAIL', data: error.response.data})
		});	
}

export function confirmChangeEmail(userId, changeEmailToken, password, twoFactorToken) {
	dispatcher.dispatch({type: 'CONFIRMING_CHANGE_EMAIL'})

	axios.post('/api/confirm_change_email', { userId: userId, changeEmailToken: changeEmailToken, password: password, twoFactorToken: twoFactorToken })
		.then(res => {
			dispatcher.dispatch({type: 'CONFIRMED_CHANGE_EMAIL', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CONFIRMING_CHANGE_EMAIL', data: error.response.data})
		});	
}