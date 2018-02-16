import { EventEmitter } from "events";
import dispatcher from '../dispatchers/dispatcher.js'
import _ from 'underscore'

import * as ConfirmDialogActions from  '../actions/confirmdialogactions.js'

class ConfirmDialogStore extends EventEmitter {
	constructor() {
		super()

		this.title = 'AreYouSure';
		this.body = 'AreYouSure';
		this.yes = 'Yes';
		this.no = 'No'

		this.caller = ''
		this.lastClicked = ''
	}
	
	handleActions(action) {
		switch(action.type) {
			case "OPEN_CONFIRM_DIALOG": {
				this.caller = action.caller;

				action.texts = action.texts || {}

				this.title = action.texts.title || 'AreYouSure';
				this.body = action.texts.body || 'AreYouSure';
				this.yes = action.texts.yes || 'Yes';
				this.no = action.texts.no || 'No';

				this.emit('openConfirmDialog');
				break;
			}

			case "CLOSE_CONFIRM_DIALOG": {
				this.lastClicked = action.clicked;
				this.emit('closeConfirmDialog');				
				break;
			}
		}
	}
}

const confirmDialogStore = new ConfirmDialogStore;
dispatcher.register(confirmDialogStore.handleActions.bind(confirmDialogStore));

export default confirmDialogStore;