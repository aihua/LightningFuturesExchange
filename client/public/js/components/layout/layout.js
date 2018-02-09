import React from "react";
import ReactDom from "react-dom";

import Header from "./header/header.js"
import Footer from "./footer/footer.js"

import Main from "../main/main.js"

import I18nStore from '../../stores/i18nstore.js'

export default class Layout extends React.Component {
	componentWillMount() {
		I18nStore.on('changeLanguage', () => {
			this.forceUpdate();
		})
	}

	render() {
		if (I18nStore.getCurrentLanguageJSON()) {
			return (
				<div>
					<Header/>
					<Main />
					<Footer/>
				</div>
			);
		} else {
			return (
				<div>
				</div>
			);
		}
	}
}