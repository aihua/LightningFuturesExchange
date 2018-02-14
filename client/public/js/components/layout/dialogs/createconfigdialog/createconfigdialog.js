import React from "react";
import ReactDom from "react-dom";

import $ from "jquery";
import ConfigStore from '../../../../stores/configstore.js';
import I18nStore from '../../../../stores/i18nstore.js';

import * as ConfigActions from  '../../../../actions/configactions.js'

export default class CreateConfigDialog extends React.Component {
	constructor() {
		super()

		this.state = {
			checkPasswordsMatch: false,
			createPassword: '',
			confirmPassword: ''
		}
	}

	toggleModel = () => {
		if (this.refs.modal) {
			if (ConfigStore.requiresCreatePassword) {
				$(this.refs.modal).modal({
					show: ConfigStore.requiresCreatePassword,
					backdrop: 'static'
				})
			} else {
				$(this.refs.modal).modal('hide');
			}
		}
	}

	componentWillMount() {
		ConfigStore.on('changedConfigPocession', this.toggleModel);
		ConfigStore.on('changedCreateConfigStatus', this._forceUpdate)
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

	        if (this.refs.createpassword.value !== this.refs.confirmpassword.value) {
	        	this.setState({
	        		checkPasswordsMatch: true
	        	})
	        	event.preventDefault();
	         	event.stopPropagation();
	        	success = false;
	        }

	        if (success) {
	        	ConfigActions.createConfig(this.state.createPassword);
	        }

	        this.refs.form.classList.add('was-validated');
		})
	}

	componentWillUnmount() {
		ConfigStore.unbindListener('changedConfigPocession', this.toggleModel);
		ConfigStore.on('changedCreateConfigStatus', this._forceUpdate)
	}

	handleTextChangeCreate = (e) => {
		this.state.createPassword = e.target.value;
		this.handleTextChange();
	}

	handleTextChangeConfirm = (e) => {
		this.state.confirmPassword = e.target.value;
		this.handleTextChange();
	}

	handleTextChange = () => {
		this.setState({
			checkPasswordsMatch: this.state.checkPasswordsMatch && ((this.state.createPassword !== this.state.confirmPassword) || this.state.createPassword === ''),
		})
	}

	_forceUpdate = () => {
		this.forceUpdate();
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		const showAlert = this.state.checkPasswordsMatch && (this.state.createPassword !== this.state.confirmPassword || this.state.createPassword === '');
		const disabled = ConfigStore.createConfigStatus === 'fetching'

		return (
			<div class="modal" tabIndex="-1" role="dialog" ref="modal" aria-hidden="true" role="dialog">
				<form id="createconfirmform" class="needs-validation" noValidate={true} ref="form">
			 		<div class="modal-dialog" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<h5 class="modal-title">{t.Generic.CreateConfig}</h5>
							</div>
							<div class="modal-body">
								<div class="form-group row">
									<label for="createpassword" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.Password + ':'}</b></label>
									<div class="col-sm-7">
										<input ref="createpassword" id="createpassword" type="password" class="form-control form-control-sm" required={true} minLength="8" value={this.state.createPassword} onChange={this.handleTextChangeCreate} disabled={disabled}/>
										<div class="invalid-feedback">
											{t.Validation.PasswordOfLengthEight}
										</div>
									</div>
								</div>
								<div class="form-group row">
									<label for="confirmpassword" class="col-sm-5 col-form-label col-form-label-sm"><b>{t.Generic.ConfirmPassword + ':'}</b></label>
									<div class="col-sm-7">
										<input ref="confirmpassword" id="confirmpassword" type="password" class="form-control form-control-sm" required={true} minLength="8" value={this.state.confirmPassword} onChange={this.handleTextChangeConfirm}  disabled={disabled}/>
										<div class="invalid-feedback">
											{t.Validation.PasswordOfLengthEight}
										</div>
									</div>
								</div>
								<div class="form-group row" style={{display: showAlert ? 'flex' : 'none' }}>
									<div class="alert alert-danger" style={{width: '100%'}}>
										{t.Validation.PasswordsMustMatch}
									</div>
								</div>
							</div>
							<div class="modal-footer">
								<button type="submit" class="btn btn-primary" disabled={disabled}>{t.Generic.Save}</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		);
	}
}