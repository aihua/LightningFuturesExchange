import { EventEmitter } from "events";
import Languages from "../../translations/languages.js"
import dispatcher from '../dispatchers/dispatcher.js'
import axios from 'axios'
import cookie from 'react-cookies'
import _ from 'underscore'

class I18nStore extends EventEmitter {
	constructor() {
		super()

		this.languages = Languages;
		this.languageJSONs = {}
		this.currentLanguage = this.getDefaultLanguage();
		this.currentLanguageJSON = null;

		this.setLanguage(this.currentLanguage);
	}

	getDefaultLanguage() {
		const cookieVal = cookie.load('language');
		const language = cookieVal || navigator.language.split('-')[0];
		return !_.contains(this.languages, language) ? 'en' : language
	}

	_setLanguageSimple(language) {
		this.currentLanguageJSON = this.languageJSONs[language];

		const expires = new Date()
		expires.setDate(expires.getDate() + 36000)

		cookie.save('language', language, { path: '/', expires, maxAge: 1000 })
		this.emit('changeLanguage');
	}

	setLanguage(language) {
		this.currentLanguage = language;

		if (!this.languageJSONs[language]) {
			axios.get('/translations/translation-' + language + '.json')
				.then(res => {
					this.languageJSONs[language] = res.data;
					this._setLanguageSimple(language);
				})
		} else {
			this._setLanguageSimple(language);
		}
	}

	getLanguages() {
		return this.languages;
	}

	getCurrentLanguage() {
		return this.currentLanguage;
	}

	getCurrentLanguageJSON() {
		return this.currentLanguageJSON;
	}

	handleActions(action) {
		switch(action.type) {
			case "SET_LANGUAGE": {
				this.setLanguage(action.language)
			}
		}
	}
}

window.reloadLanguages = function () {
	axios.post('/api2/i18n', {})
}

const i18nStore = new I18nStore;
dispatcher.register(i18nStore.handleActions.bind(i18nStore));

export default i18nStore;