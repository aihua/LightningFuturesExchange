import { EventEmitter } from "events";
import dispatcher from '../dispatchers/dispatcher.js'

import * as LoginActions from '../actions/loginactions.js'

class ChangePasswordStore extends EventEmitter {
	constructor() {
		super()

		this.changePasswordStatus = 'idle';
		this.changePasswordError = '';
	}
	
	handleActions(action) {
		switch(action.type) {
			//Change password
			case "CHANGING_PASSWORD": {
				this.changePasswordStatus = 'fetching'
				this.emit('changedChangePasswordStatus');
				break;
			}
			case "CHANGED_PASSWORD": {
				setTimeout(function () {
					LoginActions.updateUser(action.data.user);
				}, 0)

				this.changePasswordStatus = 'fetched'
				this.emit('changedChangePasswordStatus');
				this.changePasswordStatus = 'idle'
				this.emit('changedChangePasswordStatus');
				break;
			}
			case "ERROR_CHANGING_PASSWORD": {
				this.changePasswordError = action.data;
				this.changePasswordStatus = 'error'
				this.emit('changedChangePasswordStatus');
				this.changePasswordStatus = 'idle'
				this.emit('changedChangePasswordStatus');
				break;
			}
		}
	}
}

const changePasswordStore = new ChangePasswordStore();
dispatcher.register(changePasswordStore.handleActions.bind(changePasswordStore));

export default changePasswordStore;