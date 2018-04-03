import * as LoginActions from  '../actions/loginactions.js'

import axios from 'axios'

class AxiosInitializer {
	constructor() {
		axios.interceptors.response.use(
			function (response) {
				return response;
			}, 
			function (error) {
				if (error && error.response && error.response.status === 401) {
					setTimeout(function () {
						LoginActions.changeLoggedInState('loggedout');						
					}, 0);
				}
				return Promise.reject(error);
			});
	}
}

const axiosInitializer = new AxiosInitializer;

export default axiosInitializer;