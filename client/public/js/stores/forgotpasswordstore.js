import { EventEmitter } from "events";
import dispatcher from '../dispatchers/dispatcher.js'

class ForgotPasswordStore extends EventEmitter {
	constructor() {
		super()

		this.forgotPasswordStatus = 'idle';
		this.forgotPasswordError = '';

		this.checkUser = null;
		this.checkForgotPasswordStatus = 'idle';
		this.checkForgotPasswordError = '';

		this.confirmUser = null;
		this.confirmForgotPasswordStatus = 'idle';
		this.confirmForgotPasswordError = '';		
	}
	
	handleActions(action) {
		switch(action.type) {
			//Forget password
			case "FORGETTING_PASSWORD": {
				this.forgotPasswordStatus = 'fetching'
				this.emit('changedForgotPasswordStatus');
				break;
			}
			case "FORGOT_PASSWORD": {
				this.forgotPasswordStatus = 'fetched'
				this.emit('changedForgotPasswordStatus');
				this.forgotPasswordStatus = 'idle'
				this.emit('changedForgotPasswordStatus');
				break;
			}
			case "ERROR_FORGETTING_PASSWORD": {
				this.forgotPasswordError = action.data;
				this.forgotPasswordStatus = 'error'
				this.emit('changedForgotPasswordStatus');
				this.forgotPasswordStatus = 'idle'
				this.emit('changedForgotPasswordStatus');
				break;
			}

			//Checking forget password
			case "CHECKING_FORGOT_PASSWORD": {
				this.checkUser = null;
				this.checkForgotPasswordStatus = 'fetching'
				this.emit('changedCheckForgotPasswordStatus');
				break;
			}
			case "CHECKED_FORGOT_PASSWORD": {
				this.checkUser = action.data.user;
				this.checkForgotPasswordStatus = 'fetched'
				this.emit('changedCheckForgotPasswordStatus');
				this.checkForgotPasswordStatus = 'idle'
				this.emit('changedCheckForgotPasswordStatus');
				break;
			}
			case "ERROR_CHECKING_FORGOT_PASSWORD": {
				this.checkForgotPasswordError = action.data;
				this.checkForgotPasswordStatus = 'error'
				this.emit('changedCheckForgotPasswordStatus');
				this.checkForgotPasswordStatus = 'idle'
				this.emit('changedCheckForgotPasswordStatus');
				break;
			}

			//Confirming forget password
			case "CONFIRMING_FORGOT_PASSWORD": {
				this.confirmUser = null;
				this.confirmForgotPasswordStatus = 'fetching'
				this.emit('changedConfirmForgotPasswordStatus');
				break;
			}
			case "CONFIRMED_FORGOT_PASSWORD": {
				this.confirmUser = action.data.user;
				this.confirmForgotPasswordStatus = 'fetched'
				this.emit('changedConfirmForgotPasswordStatus');
				this.confirmForgotPasswordStatus = 'idle'
				this.emit('changedConfirmForgotPasswordStatus');
				break;
			}
			case "ERROR_CONFIRMING_FORGOT_PASSWORD": {
				this.confirmForgotPasswordError = action.data;
				this.confirmForgotPasswordStatus = 'error'
				this.emit('changedConfirmForgotPasswordStatus');
				this.confirmForgotPasswordStatus = 'idle'
				this.emit('changedConfirmForgotPasswordStatus');
				break;
			}
		}
	}
}

const forgotPasswordStore = new ForgotPasswordStore();
dispatcher.register(forgotPasswordStore.handleActions.bind(forgotPasswordStore));

export default forgotPasswordStore;