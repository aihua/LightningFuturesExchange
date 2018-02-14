import * as ConfigActions from  '../actions/configactions.js'
import axios from 'axios'

class AxiosInitializer {
	constructor() {
		axios.interceptors.response.use(
			function (response) {
				return response;
			}, 
			function (error) {
				if (error.response.data === 'noConfig') {
					ConfigActions.setNoConfig();
				} else if (error.response.data === 'incorrectPassword') {
					ConfigActions.setIncorrectPassword();
				} else if (error.response.data === 'configAlreadyExists') {
					ConfigActions.configExists();
				}
				return Promise.reject(error);
			});
	}
}

const axiosInitializer = new AxiosInitializer;

export default axiosInitializer;