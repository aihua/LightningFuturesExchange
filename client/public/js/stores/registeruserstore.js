import { EventEmitter } from "events";
import dispatcher from '../dispatchers/dispatcher.js'

class RegisterUserStore extends EventEmitter {
	constructor() {
		super()



		this.registerUserStatus = 'idle';
		this.registerUserError = '';

		this.confirmUser = null;
		this.confirmUserStatus = 'idle';
		this.confirmUserError = '';
	}
	
	handleActions(action) {
		switch(action.type) {
			//Register User
			case "REGISTERING_USER": {
				this.registerUserStatus = 'fetching'
				this.emit('changedRegisterUserStatus');
				break;
			}
			case "REGISTERED_USER": {
				this.registerUserStatus = 'fetched'
				this.emit('changedRegisterUserStatus');
				this.registerUserStatus = 'idle'
				this.emit('changedRegisterUserStatus');
				break;
			}
			case "ERROR_REGISTERING_USER": {
				this.registerUserError = action.data;
				this.registerUserStatus = 'error'
				this.emit('changedRegisterUserStatus');
				this.registerUserStatus = 'idle'
				this.emit('changedRegisterUserStatus');
				break;
			}

			//Confirm Register User
			case "CONFIRMING_USER": {
				this.confirmUser = null;
				this.confirmUserStatus = 'fetching'
				this.emit('changedConfirmUserStatus');
				break;
			}
			case "CONFIRMED_USER": {
				this.confirmUser = action.data.user
				this.confirmUserStatus = 'fetched'
				this.emit('changedConfirmUserStatus');
				this.confirmUserStatus = 'idle'
				this.emit('changedConfirmUserStatus');
				break;
			}
			case "ERROR_CONFIRMING_USER": {
				this.confirmUserError = action.data;
				this.confirmUserStatus = 'error'
				this.emit('changedConfirmUserStatus');
				this.confirmUserStatus = 'idle'
				this.emit('changedConfirmUserStatus');
				break;
			}
		}
	}
}

const registerUserStore = new RegisterUserStore();
dispatcher.register(registerUserStore.handleActions.bind(registerUserStore));

export default registerUserStore;