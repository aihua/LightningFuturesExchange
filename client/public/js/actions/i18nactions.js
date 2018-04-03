import dispatcher from '../dispatchers/dispatcher.js'

export function setLanguage(language) {
	dispatcher.dispatch({
		type: 'SET_LANGUAGE',
		language: language
	})
}