import React from "react";
import ReactDom from "react-dom";

import Header from "./header/header.js"
import Footer from "./footer/footer.js"

import Main from "../main/main.js"

export default class Layout extends React.Component {
	render() {
		return (
			<div>
				<Header/>
				<Main />
				<Footer/>
			</div>
		);
	}
}