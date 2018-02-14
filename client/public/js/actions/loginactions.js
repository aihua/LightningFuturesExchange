import dispatcher from '../dispatchers/dispatcher.js'
import axios from 'axios'

export function login(password) {
	dispatcher.dispatch({type: 'LOGGING_IN'})

	axios.post('/api/config', password)
		.then(res => {
			dispatcher.dispatch({type: 'LOGGED_IN', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_LOGGING_IN', data: error.response.data})
		});	
}