import React from "react";
import ReactDom from "react-dom";

import $ from "jquery";
import ConfigStore from '../../../../stores/configstore.js';
import I18nStore from '../../../../stores/i18nstore.js';

import * as ConfigActions from  '../../../../actions/configactions.js'

export default class LoginDialog extends React.Component {
	constructor() {
		super()
	}

	toggleModel = () => {
		if (this.refs.modal) {
			if (ConfigStore.requiresLogin) {
				$(this.refs.modal).modal({
					show: ConfigStore.requiresLogin,
					backdrop: 'static'
				})
			} else {
				$(this.refs.modal).modal('hide');
			}
		}
	}

	componentWillMount() {
		ConfigStore.on('changedConfigPocession', this.toggleModel);
		ConfigStore.on('changedLoginStatus', this._forceUpdate)
	}

	componentDidMount() {
		this.toggleModel();

		this.refs.form.addEventListener('submit', (event) => {
	        let success = true;

	        if (this.refs.form.checkValidity() === false) {
	        	event.preventDefault();
	        	event.stopPropagation();
	        	success = false;
	        }

	        if (success) {
	        	ConfigActions.login(this.refs.loginpassword.value);
	        }

	        this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		ConfigStore.unbindListener('changedConfigPocession', this.toggleModel);
		ConfigStore.on('changedLoginStatus', this._forceUpdate)
	}

	_forceUpdate = () => {
		this.forceUpdate();
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		const disabled = ConfigStore.loginStatus === 'fetching'
		const showAlert = ConfigStore.loginError === 'incorrectPassword';

		return (
			<div class="modal" tabIndex="-1" role="dialog" ref="modal" aria-hidden="true" role="dialog">
				<form id="createconfirmform" class="needs-validation" noValidate={true} ref="form">
			 		<div class="modal-dialog" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<h5 class="modal-title">{t.Generic.Login}</h5>
							</div>
							<div class="modal-body">
								<div class="form-group row">
									<label for="loginpassword" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.Password + ':'}</b></label>
									<div class="col-sm-7">
										<input ref="loginpassword" id="loginpassword" type="password" class="form-control form-control-sm" required={true} minLength="8" disabled={disabled}/>
										<div class="invalid-feedback">
											{t.Validation.PasswordOfLengthEight}
										</div>
									</div>
								</div>
								<div class="form-group row" style={{display: showAlert ? 'flex' : 'none' }}>
									<div class="alert alert-danger" style={{width: '100%'}}>
										{t.Error.IncorrectPassword}
									</div>
								</div>								
							</div>
							<div class="modal-footer">
								<button type="submit" class="btn btn-primary" disabled={disabled}>{t.Generic.Login}</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		);
	}
}