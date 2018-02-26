import React from "react";
import ReactDom from "react-dom";

import { Route, Switch } from "react-router-dom";
import IndexPage from "../pages/index_page/index_page.js"
import LoginPage from "../pages/login_page/login_page.js"
import RegisterPage from "../pages/register_page/register_page.js"
import ConfirmRegisterPage from "../pages/confirm_register_page/confirm_register_page.js"
import ForgotPasswordPage from "../pages/forgot_password_page/forgot_password_page.js"
import ConfirmForgotPasswordPage from "../pages/confirm_forgot_password_page/confirm_forgot_password_page.js"
import ChangeUsernamePage from "../pages/change_username_page/change_username_page.js"
import ChangeEmailPage from "../pages/change_email_page/change_email_page.js"
import ConfirmChangeEmailPage from "../pages/confirm_change_email_page/confirm_change_email_page.js"
import ChangePasswordPage from "../pages/change_password_page/change_password_page.js"

export default class Main extends React.Component {
	render() {
		return (
		  <main>
		    <Switch>
				<Route exact path='/' component={IndexPage}/>
				<Route exact path='/login' component={LoginPage}/>
				<Route exact path='/register' component={RegisterPage}/>
				<Route exact path='/confirm_register' component={ConfirmRegisterPage}/>
				<Route exact path='/forgot_password' component={ForgotPasswordPage}/>
				<Route exact path='/confirm_forgot_password' component={ConfirmForgotPasswordPage}/>
				<Route exact path='/change_username' component={ChangeUsernamePage}/>
				<Route exact path='/change_email' component={ChangeEmailPage}/>
				<Route exact path='/confirm_change_email' component={ConfirmChangeEmailPage}/>
				<Route exact path='/change_password' component={ChangePasswordPage}/>
		    </Switch>
		  </main>
		);
	}
}