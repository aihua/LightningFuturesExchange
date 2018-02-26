import dispatcher from '../dispatchers/dispatcher.js'
import axios from 'axios'


export function forgotPassword(username) {
	dispatcher.dispatch({type: 'FORGETTING_PASSWORD'})

	axios.post('/api/forgot_password', { username: username })
		.then(res => {
			dispatcher.dispatch({type: 'FORGOT_PASSWORD', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_FORGETTING_PASSWORD', data: error.response.data})
		});	
}

export function checkForgotPassword(userId, forgotPasswordToken) {
	dispatcher.dispatch({type: 'CHECKING_FORGOT_PASSWORD'})

	axios.post('/api/check_forgot_password', { userId: userId, forgotPasswordToken: forgotPasswordToken })
		.then(res => {
			dispatcher.dispatch({type: 'CHECKED_FORGOT_PASSWORD', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CHECKING_FORGOT_PASSWORD', data: error.response.data})
		});	
}

export function confirmForgotPassword(userId, forgotPasswordToken, password) {
	dispatcher.dispatch({type: 'CONFIRMING_FORGOT_PASSWORD'})

	axios.post('/api/confirm_forgot_password', { userId: userId, forgotPasswordToken: forgotPasswordToken, password: password })
		.then(res => {
			dispatcher.dispatch({type: 'CONFIRMED_FORGOT_PASSWORD', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CONFIRMING_FORGOT_PASSWORD', data: error.response.data})
		});	
}