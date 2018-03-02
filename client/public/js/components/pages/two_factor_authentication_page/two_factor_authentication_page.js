import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../stores/i18nstore.js'

import LoginStore from '../../../stores/loginstore.js'
import * as LoginActions from  '../../../actions/loginactions.js'

import { htmlEncode } from 'js-htmlencode'

export default class TwoFactorAuthenticationPage extends React.Component {
	constructor() {
		super();

		this.state = {
			validationError: '',
			validation0: '',
			changeUsernameSuccess: false
		}
	}

	componentWillMount() {
		LoginStore.on('changedLoggedInState', this._forceUpdate);
		LoginStore.on('updatedUser', this._forceUpdate);

		if (!LoginStore.user && LoginStore.loggedInState !== 'unknown') window.location.href = '#';
	}

	componentWillUnmount() {
		LoginStore.removeListener('changedLoggedInState', this._forceUpdate);
		LoginStore.removeListener('updatedUser', this._forceUpdate);
	}


	_forceUpdate = () => {
		this.forceUpdate();
	}

	enableClicked = () => {
		LoginActions.open2FADialog();
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();
		const user = LoginStore.user || {};

		return (
			<div class="container-fluid">
				<div class="row">
					<div class="col-md-12">
						<form class="needs-validation" noValidate={true} ref="form">
							<div class="card card-form">
								<div class="card-header">
									<h2>{t.Generic.TwoFactorAuthentication}</h2>
								</div>
								<div class="card-body">
									<div class="form-group row">
										<label for="two_factor_authentication_username"><b>{t.Generic.Username + ':'}</b></label>
										<label id="two_factor_authentication_username">{(LoginStore.user || {}).username || ''}</label>
									</div>
									<div class="form-group row">
										<label for="two_factor_authentication_email"><b>{t.Generic.Email + ':'}</b></label>
										<label id="two_factor_authentication_email">{(LoginStore.user || {}).email || ''}</label>
									</div>
									<div class="form-group row">
										<label for="two_factor_authentication_enabled"><b>{t.Generic['2FAEnabled'] + ':'}</b></label>
										<label id="two_factor_authentication">{t.Generic[user.twoFactorEnabled ? 'Yes' : 'No' ]}</label>
									</div>
								</div>
								<div class="card-footer">
									<div class="small-vert-padding pull-right">
										<button type="button" class={'btn btn-' + (user.twoFactorEnabled ? 'danger' : 'success') + ' btn-lg'} onClick={this.enableClicked}>{t.Generic[user.twoFactorEnabled ? 'Disable' : 'Enable']}</button>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		)
	}
}