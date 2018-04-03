import dispatcher from '../dispatchers/dispatcher.js'
import axios from 'axios'


export function changePassword(newPassword, password, twoFactorToken) {
	dispatcher.dispatch({type: 'CHANGING_PASSWORD'})

	axios.post('/api/change_password', { newPassword: newPassword, password: password, token: twoFactorToken })
		.then(res => {
			dispatcher.dispatch({type: 'CHANGED_PASSWORD', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CHANGING_PASSWORD', data: error.response.data})
		});	
}