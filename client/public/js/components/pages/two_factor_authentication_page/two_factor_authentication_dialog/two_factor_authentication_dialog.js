import React from "react";
import ReactDom from "react-dom";
import QRCode from "qrcode-react";

import I18nStore from '../../../../stores/i18nstore.js'
import LoginStore from '../../../../stores/loginstore.js'
import * as LoginActions from '../../../../actions/loginactions.js'

import $ from 'jquery';

import { htmlEncode } from 'js-htmlencode'
import queryString from 'query-string';

export default class TwoFactorAuthenticationDialog extends React.Component {
	constructor() {
		super()

		this.state = {
			isEnabling: false,
			otpauth: null,
			error: '',
			error0: '',
			loadingError: false
		}
	}

	componentWillMount() {
		LoginStore.on('open2FADialog', this.showDialog);
		LoginStore.on('changedLoggedInState', this.changedLoggedInState);		
		LoginStore.on('changedGetTwoFactorTokenStatus', this.updateStatuses)		
		LoginStore.on('changedEnableTwoFactorAuthenticationStatus', this.updateStatuses)
		LoginStore.on('changedDisableTwoFactorAuthenticationStatus', this.updateStatuses)
	}

	resize_canvas = () => {
		let $canvas = $('#twofactordialogform canvas')
		$canvas.height($canvas.width());
	}

	componentDidMount() {
		this.refs.form.addEventListener('submit', (event) => {
			if (this.refs.form.checkValidity() === false) {
			} else {
				if (!LoginStore.user.twoFactorEnabled) {
					LoginActions.enableTwoFactorAuthentication(this.refs.twofaToken.value);
				} else {
					LoginActions.disableTwoFactorAuthentication(this.refs.twofaToken.value);
				}
			}

			event.preventDefault();
			event.stopPropagation();
			this.refs.form.classList.add('was-validated');
		})

		$(window).resize(this.resize_canvas);
	}

	componentWillUnmount() {
		LoginStore.removeListener('open2FADialog', this.showDialog);
		LoginStore.removeListener('changedLoggedInState', this.changedLoggedInState);		
		LoginStore.removeListener('changedGetTwoFactorTokenStatus', this.updateStatuses)		
		LoginStore.removeListener('changedEnableTwoFactorAuthenticationStatus', this.updateStatuses)
		LoginStore.removeListener('changedDisableTwoFactorAuthenticationStatus', this.updateStatuses)

		$(window).unbind('resize', this.resize_canvas);
	}

	showDialog = () => {
		this.setState({
			isEnabling: !LoginStore.user.twoFactorEnabled,
			otpauth: null,
			error: '',
			error0: '',			
			loadingError: false
		});

		this.refs.form.classList.remove('was-validated');
		this.refs.twofaToken.value = '';
		setTimeout(() => {
			if (!LoginStore.user.twoFactorEnabled) LoginActions.getTwoFactorToken();
		}, 0);
		this._showDialogHelper(true);
	}

	changedLoggedInState = () => {
		$(this.refs.modal).modal('hide');
	}

	_showDialogHelper = (show) => {
		$(this.refs.modal).modal({
			backdrop: 'static',
			show: show
		});
	}

	updateStatuses = () => {
		if (LoginStore.getTwoFactorTokenStatus === 'fetched') {
			this.setState({
				otpauth: LoginStore.otpauth
			});
			setTimeout(() => {
				this.resize_canvas();
			}, 100);
		} else if (LoginStore.enableTwoFactorAuthenticationStatus === 'fetched' || LoginStore.disableTwoFactorAuthenticationStatus === 'fetched') {
			$(this.refs.modal).modal('hide');
		} else if (LoginStore.getTwoFactorTokenStatus === 'error') {
			this.setState({
				error: LoginStore.getTwoFactorTokenError.message || 'UnknownError',
				error0: LoginStore.getTwoFactorTokenError['0'],
				loadingError: true
			});
		} else if (LoginStore.enableTwoFactorAuthenticationStatus === 'error') {
			this.setState({
				error: LoginStore.enableTwoFactorAuthenticationError.message || 'UnknownError',
				error0: LoginStore.enableTwoFactorAuthenticationError['0']
			});
		} else if (LoginStore.disableTwoFactorAuthenticationStatus === 'error') {
			this.setState({
				error: LoginStore.disableTwoFactorAuthenticationError.message || 'UnknownError',
				error0: LoginStore.disableTwoFactorAuthenticationError['0']
			});
		} else {
			this.forceUpdate();
		}
	}

	_forceUpdate = () => {
		this.forceUpdate();
	}

	cancel = () => {
		$(this.refs.modal).modal('hide');
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();
		const user = LoginStore.user || {};
		const allDisabled = LoginStore.getTwoFactorTokenStatus === 'fetching' ||
							LoginStore.enableTwoFactorAuthenticationStatus === 'fetching' ||
							LoginStore.disableTwoFactorAuthenticationStatus === 'fetching';
							

		const validationError = (t.Error[this.state.error] || '').replace('{0}', htmlEncode(this.state.error0 || '')) || t.Error.UnknownError;

		const query = queryString.parse(LoginStore.otpauth || '');

		return (
			<div id="twofactordialog" class="modal fade" tabIndex="-1" role="dialog" ref="modal" aria-hidden="true" style={{zIndex: 1051}}>
				<form id="twofactordialogform" class="needs-validation" noValidate={true} ref="form">
			 		<div class="modal-dialog" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<h5 class="modal-title">{t.Generic[!this.state.isEnabling ? 'Disable2FA' : 'Enable2FA']}</h5>
								<button type="button" class="close" onClick={this.cancel} disabled={allDisabled}>
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div class="modal-body ml-2 mr-2">
								<div class="form-group row" style={{display: (!this.state.isEnabling) ? 'none' : 'flex' }}>
									<label><b>{t.Generic['2FASecret'] + ':'}</b></label>
									<div class="w-100 text-center">
										<QRCode value={LoginStore.otpauth || ''} size={256}/>
									</div>
								</div>
								<div class="form-group row">
									<label for="two_f_a_dialog_token"><b>{t.Generic['2FAToken'] + ':'}</b></label>
									<input ref="twofaToken" type="text" class="form-control" id="two_f_a_dialog_token" required={true} pattern="[0-9]{6,6}" disabled={allDisabled || this.state.loadingError} autoComplete="off"/>
									<div class="invalid-feedback">
										{t.Validation.PleaseEnter2FA}
									</div>
								</div>
								<div class="form-group row mb-0" style={{display: !!this.state.error ? 'flex' : 'none' }}>
									<div class="alert alert-danger mb-0" style={{width: '100%'}} dangerouslySetInnerHTML={{__html: validationError}} />
								</div>
							</div>
							<div class="modal-footer">
								<button type="submit" class="btn btn-primary" disabled={allDisabled || this.state.loadingError}>{t.Generic.Confirm}</button>
								<button type="button" class="btn btn-default" onClick={this.cancel} disabled={allDisabled}>{t.Generic.Cancel}</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		);
	}
}