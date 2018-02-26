import dispatcher from '../dispatchers/dispatcher.js'
import axios from 'axios'


export function changeUsername(newUsername, password) {
	dispatcher.dispatch({type: 'CHANGING_USERNAME'})

	axios.post('/api/change_username', { newUsername: newUsername, password: password })
		.then(res => {
			dispatcher.dispatch({type: 'CHANGED_USERNAME', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CHANGING_USERNAME', data: error.response.data})
		});	
}