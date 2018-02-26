import { EventEmitter } from "events";
import dispatcher from '../dispatchers/dispatcher.js'

import * as LoginActions from '../actions/loginactions.js'

class ChangeUsernameStore extends EventEmitter {
	constructor() {
		super()

		this.changeUsernameStatus = 'idle';
		this.changeUsernameError = '';
	}
	
	handleActions(action) {
		switch(action.type) {
			//Change username
			case "CHANGING_USERNAME": {
				this.changeUsernameStatus = 'fetching'
				this.emit('changedChangeUsernameStatus');
				break;
			}
			case "CHANGED_USERNAME": {
				setTimeout(function () {
					LoginActions.updateUser(action.data.user);
				}, 0)

				this.changeUsernameStatus = 'fetched'
				this.emit('changedChangeUsernameStatus');
				this.changeUsernameStatus = 'idle'
				this.emit('changedChangeUsernameStatus');
				break;
			}
			case "ERROR_CHANGING_USERNAME": {
				this.changeUsernameError = action.data;
				this.changeUsernameStatus = 'error'
				this.emit('changedChangeUsernameStatus');
				this.changeUsernameStatus = 'idle'
				this.emit('changedChangeUsernameStatus');
				break;
			}
		}
	}
}

const changeUsernameStore = new ChangeUsernameStore();
dispatcher.register(changeUsernameStore.handleActions.bind(changeUsernameStore));

export default changeUsernameStore;