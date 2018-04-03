import React from "react";
import ReactDom from "react-dom";

import IndexPageLoggedOut from './index_page_logged_out/index_page_logged_out.js'
import IndexPageLoggedIn from './index_page_logged_in/index_page_logged_in.js'

import LoginStore from '../../../stores/loginstore.js'


export default class IndexPage extends React.Component {
	componentWillMount() {
		LoginStore.on('changedLoggedInState', this._forceUpdate);
	}

	componentWillUnmount() {
		LoginStore.removeListener('changedLoggedInState', this._forceUpdate)
	}

	_forceUpdate = () => {
		this.forceUpdate();
	}

	render() {
		if (LoginStore.loggedInState === 'loggedin') {
			return <div><IndexPageLoggedIn /></div>
		} else if (LoginStore.loggedInState === 'loggedout') {
			return <div><IndexPageLoggedOut /></div>
		} else if (LoginStore.loggedInState === 'unknown') {
			return <div></div>
		}
	}
}