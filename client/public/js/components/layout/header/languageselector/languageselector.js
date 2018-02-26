import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../../stores/i18nstore.js'
import * as I18nActions from '../../../../actions/i18nactions.js'

import _ from 'underscore'

export default class LanguageSelector extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		  selectedLanguage: I18nStore.getCurrentLanguage()
		};
	}

	componentWillMount() {
		I18nStore.on('changeLanguage', this.onChangeLanguage)
	}

	componentWillUnmount() {
		I18nStore.removeListener('changeLanguage', this.onChangeLanguage)
	}

	onChangeLanguage = () => {
		this.setState({
			selectedLanguage: I18nStore.getCurrentLanguage()
		})
	}

	setLanguage = (language) => {
		return (e) => {
			I18nActions.setLanguage(language);
			e.preventDefault();
		}
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		const languageLinks =_.map(I18nStore.getLanguages(), (l) => {
			return (
				<a key={l} class="dropdown-item" href="#" onClick={this.setLanguage(l)}>
					<i class={"flag-icon flag-icon-" + t.LanguagesFlags[l] } /> {t.Languages[l]}
				</a>
			);
		})


		return (
			<li class="nav-item dropdown">
				<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					<i class={"flag-icon flag-icon-" + t.LanguagesFlags[this.state.selectedLanguage]} />
				</a>
				<div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
					{languageLinks}
				</div>
			</li>
		);
	}
}