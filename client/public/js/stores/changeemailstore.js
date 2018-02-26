import { EventEmitter } from "events";
import dispatcher from '../dispatchers/dispatcher.js'

import * as LoginActions from '../actions/loginactions.js'

class ChangeEmailStore extends EventEmitter {
	constructor() {
		super()

		this.changeEmailStatus = 'idle';
		this.changeEmailError = '';

		this.confirmUser = null;
		this.confirmChangeEmailStatus = 'idle';
		this.confirmChangeEmailError = '';
	}
	
	handleActions(action) {
		switch(action.type) {
			//Change email
			case "CHANGING_EMAIL": {
				this.changeEmailStatus = 'fetching'
				this.emit('changedChangeEmailStatus');
				break;
			}
			case "CHANGED_EMAIL": {
				this.changeEmailStatus = 'fetched'
				this.emit('changedChangeEmailStatus');
				this.changeEmailStatus = 'idle'
				this.emit('changedChangeEmailStatus');
				break;
			}
			case "ERROR_CHANGING_EMAIL": {				
				this.changeEmailError = action.data;
				this.changeEmailStatus = 'error'
				this.emit('changedChangeEmailStatus');
				this.changeEmailStatus = 'idle'
				this.emit('changedChangeEmailStatus');
				break;
			}

			//Confirm change email
			case "CONFIRMING_CHANGE_EMAIL": {
				this.confirmUser = null;
				this.confirmChangeEmailStatus = 'fetching'
				this.emit('changedConfirmChangeEmailStatus');
				break;
			}
			case "CONFIRMED_CHANGE_EMAIL": {
				setTimeout(function () {
					LoginActions.updateUser(action.data.user);
				}, 0)

				this.confirmUser = action.data.user;
				this.confirmChangeEmailStatus = 'fetched'
				this.emit('changedConfirmChangeEmailStatus');
				this.confirmChangeEmailStatus = 'idle'
				this.emit('changedConfirmChangeEmailStatus');
				break;
			}
			case "ERROR_CONFIRMING_CHANGE_EMAIL": {
				this.confirmChangeEmailError = action.data;
				this.confirmChangeEmailStatus = 'error'
				this.emit('changedConfirmChangeEmailStatus');
				this.confirmChangeEmailStatus = 'idle'
				this.emit('changedConfirmChangeEmailStatus');
				break;
			}
		}
	}
}

const changeEmailStore = new ChangeEmailStore();
dispatcher.register(changeEmailStore.handleActions.bind(changeEmailStore));

export default changeEmailStore;