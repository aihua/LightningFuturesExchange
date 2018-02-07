import React from "react";
import ReactDom from "react-dom";

import { Route, Switch } from "react-router-dom";
import IndexPage from "../index_page/index_page.js"

export default class Main extends React.Component {
	render() {
		return (
		  <main>
		    <Switch>
		      <Route exact path='/' component={IndexPage}/>
		    </Switch>
		  </main>
		);
	}
}