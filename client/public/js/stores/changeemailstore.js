import { EventEmitter } from "events";
import dispatcher from '../dispatchers/dispatcher.js'

import * as LoginActions from '../actions/loginactions.js'

class ChangeEmailStore extends EventEmitter {
	constructor() {
		super()

		this.changeEmailStatus = 'idle';
		this.changeEmailError = '';

		this.checkUser = null;
		this.checkEmail = '';
		this.checkChangeEmailStatus = 'idle';
		this.checkChangeEmailError = '';

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

			//Check change email
			case "CHECKING_CHANGE_EMAIL": {
				this.checkUser = null;
				this.checkEmail = '';
				this.checkChangeEmailStatus = 'fetching'
				this.emit('changedCheckChangeEmailStatus');
				break;
			}
			case "CHECKED_CHANGE_EMAIL": {
				this.checkUser = action.data.user;
				this.checkEmail = action.data.email;
				this.checkChangeEmailStatus = 'fetched'
				this.emit('changedCheckChangeEmailStatus');
				this.checkChangeEmailStatus = 'idle'
				this.emit('changedCheckChangeEmailStatus');
				break;
			}
			case "ERROR_CHECKING_CHANGE_EMAIL": {
				this.checkChangeEmailError = action.data;
				this.checkChangeEmailStatus = 'error'
				this.emit('changedCheckChangeEmailStatus');
				this.checkChangeEmailStatus = 'idle'
				this.emit('changedCheckChangeEmailStatus');
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