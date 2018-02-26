import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import RegisterUserStore from '../../../stores/registeruserstore.js'
import * as RegisterUserActions from  '../../../actions/registeruseractions.js'
import * as LoginActions from  '../../../actions/loginactions.js'

import { htmlEncode } from 'js-htmlencode';
import queryString from 'query-string';

export default class ConfirmRegisterPage extends React.Component {
	constructor() {
		super();

		this.state = {
			error: '',
			error0: '',
			confirmRegisterSuccess: false
		}
	}

	componentWillMount() {
		LoginActions.changeLoggedInState('loggedout');
		RegisterUserStore.on('changedConfirmUserStatus', this.changedConfirmUserStatus);

		this.query = queryString.parse(this.props.location.search);


		if (!this.query.username || !this.query.token) {
			this.setState({
				error: "InvalidUrl",
				error0: ''
			})
		} else {
			RegisterUserActions.confirmUser(this.query.username, this.query.token)
		}
	}

	componentWillUnmount() {
		RegisterUserStore.removeListener('changedConfirmUserStatus', this.changedConfirmUserStatus);
	}

	changedConfirmUserStatus = () => {
		if (RegisterUserStore.confirmUserStatus === 'error') {
			this.setState({
				error: RegisterUserStore.confirmUserError.message || 'UnknownError',
				error0: RegisterUserStore.confirmUserError[0]
			});
		} else {
			if (RegisterUserStore.confirmUserStatus === 'fetching') {
				this.setState({
					error: '',
					error0: ''
				})
			} else {
				if (RegisterUserStore.confirmUserStatus === 'fetched') {
					this.setState({
						error: '',
						error0: '',
						confirmRegisterSuccess: true
					});
				}
			}
		}
	}

	getMessage = () => {
		const t = I18nStore.getCurrentLanguageJSON();

		let messageTitle = ''
		let messageBody = ''

		if (this.state.error !== '') {
			messageTitle = t.ConfirmRegister.ErrorConfirmRegister
			messageBody = ((t.Error[this.state.error] || '').replace('{0}', htmlEncode(this.state['error0'] || '')) || t.Error.UnknownError);
		} else {
			if (RegisterUserStore.confirmUserStatus === 'fetching') {
				messageTitle = t.ConfirmRegister.FetchingConfirmUserTitle;
				messageBody = t.ConfirmRegister.FetchingConfirmUserBody;
			} else if (this.state.confirmRegisterSuccess) {
				const user = RegisterUserStore.confirmUser;

				messageTitle = t.ConfirmRegister.ConfirmRegisterSuccessTitle;
				messageBody = t.ConfirmRegister.ConfirmRegisterSuccessBody.replace('{0}', htmlEncode(user.username)).replace('{1}', htmlEncode(user.email));
			} else {
				messageTitle = t.ConfirmRegister.ErrorConfirmRegister
				messageBody = t.Error.UnknownError;
			}
		}

		return {
			messageTitle: messageTitle,
			messageBody: messageBody
		}
	}

	render() {
		const message = this.getMessage();

		return (
			<div class="container-fluid">
				<div class="row">
					<div class="col-md-12">
						<div class="card card-form">
							<div class="card-header">
								<h2>{message.messageTitle}</h2>
							</div>
							<div class="card-body">
								<p class="mb-3" dangerouslySetInnerHTML={{__html: message.messageBody }} />
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}