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

export function confirmChangeEmail(userId, changeEmailToken) {
	dispatcher.dispatch({type: 'CONFIRMING_CHANGE_EMAIL'})

	axios.post('/api/confirm_change_email', { userId: userId, changeEmailToken: changeEmailToken })
		.then(res => {
			dispatcher.dispatch({type: 'CONFIRMED_CHANGE_EMAIL', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CONFIRMING_CHANGE_EMAIL', data: error.response.data})
		});	
}