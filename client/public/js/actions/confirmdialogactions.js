import dispatcher from '../dispatchers/dispatcher.js';
import axios from 'axios';

export function openConfirmDialog(caller, texts) {
	dispatcher.dispatch({type: 'OPEN_CONFIRM_DIALOG', caller: caller, texts: texts});
}

export function closeConfirmDialog(clicked) {
	dispatcher.dispatch({type: 'CLOSE_CONFIRM_DIALOG', clicked: clicked });
}