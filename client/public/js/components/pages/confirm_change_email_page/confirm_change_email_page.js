import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import ChangeEmailStore from '../../../stores/changeemailstore.js'

import * as ChangeEmailActions from  '../../../actions/changeemailactions.js'
import * as LoginActions from  '../../../actions/loginactions.js'

import { htmlEncode } from 'js-htmlencode';
import queryString from 'query-string';

export default class ConfirmChangeEmailPage extends React.Component {
	constructor() {
		super();

		this.state = {
			error: '',
			error0: '',
			confirmChangeEmailSuccess: false
		}
	}

	componentWillMount() {
		ChangeEmailStore.on('changedConfirmChangeEmailStatus', this.changedConfirmChangeEmailStatus);

		this.query = queryString.parse(this.props.location.search);

		if (!this.query.userid || !this.query.token) {
			this.setState({
				error: "InvalidUrl",
				error0: ''
			})
		} else {
			ChangeEmailActions.confirmChangeEmail(this.query.userid, this.query.token)
		}
	}

	componentWillUnmount() {
		ChangeEmailStore.removeListener('changedConfirmChangeEmailStatus', this.changedConfirmChangeEmailStatus);
	}

	changedConfirmChangeEmailStatus = () => {
		if (ChangeEmailStore.confirmChangeEmailStatus === 'error') {
			this.setState({
				error: ChangeEmailStore.confirmChangeEmailError.message || 'UnknownError',
				error0: ChangeEmailStore.confirmChangeEmailError[0]
			});
		} else {
			if (ChangeEmailStore.confirmChangeEmailStatus === 'fetching') {
				this.setState({
					error: '',
					error0: ''
				})
			} else {
				if (ChangeEmailStore.confirmChangeEmailStatus === 'fetched') {
					this.setState({
						error: '',
						error0: '',
						confirmChangeEmailSuccess: true
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
			messageTitle = t.ConfirmChangeEmail.ErrorConfirmChangeEmail
			messageBody = ((t.Error[this.state.error] || '').replace('{0}', htmlEncode(this.state['error0'] || '')) || t.Error.UnknownError);
		} else {
			if (ChangeEmailStore.confirmChangeEmailStatus === 'fetching') {
				messageTitle = t.ConfirmChangeEmail.FetchingConfirmChangeEmailTitle;
				messageBody = t.ConfirmChangeEmail.FetchingConfirmChangeEmailBody;
			} else if (this.state.confirmChangeEmailSuccess) {
				const user = ChangeEmailStore.confirmUser;

				messageTitle = t.ConfirmChangeEmail.ConfirmChangeEmailSuccessTitle;
				messageBody = t.ConfirmChangeEmail.ConfirmChangeEmailSuccessBody.replace('{0}', htmlEncode(user.username)).replace('{1}', htmlEncode(user.email));
			} else {
				messageTitle = t.ConfirmChangeEmail.ErrorConfirmChangeEmail;
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