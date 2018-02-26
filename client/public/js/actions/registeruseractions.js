import dispatcher from '../dispatchers/dispatcher.js'
import axios from 'axios'


export function registerUser(user) {
	dispatcher.dispatch({type: 'REGISTERING_USER'})

	axios.post('/api/register_user', user)
		.then(res => {
			dispatcher.dispatch({type: 'REGISTERED_USER', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_REGISTERING_USER', data: error.response.data})
		});
}

export function confirmUser(username, registrationToken) {
	dispatcher.dispatch({type: 'CONFIRMING_USER'})

	axios.post('/api/confirm_user', { username: username, registrationToken: registrationToken })
		.then(res => {
			dispatcher.dispatch({type: 'CONFIRMED_USER', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CONFIRMING_USER', data: error.response.data})
		});
}