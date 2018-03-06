import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../stores/i18nstore.js'
import LoginStore from '../../stores/loginstore.js'
import * as LoginActions from '../../actions/loginactions.js'

import QRCode from "qrcode-react";

import $ from 'jquery';

export default class QRDialog extends React.Component {
	constructor() {
		super()

		this.state = {
			address: ''
		}
	}

	componentWillMount() {
		LoginStore.on('openQRDialog', this.openQRDialog);
	}

	resize_canvas = () => {
		this.$canvas = $('#bitcoin-address-dialog-form canvas');
		this.$canvas.height(this.$canvas.width());
	}

	componentDidMount() {
		this._showDialogHelper(false);

		$(window).resize(this.resize_canvas);
	}

	componentWillUnmount() {
		LoginStore.unbindListener('openQRDialog', this.openQRDialog);

		$(window).unbind('resize', this.resize_canvas);
	}

	openQRDialog = () => {
		this.setState({
			address: LoginStore.qRDialogAddress
		});
		setTimeout(() => {
			this.resize_canvas();
		}, 180);
		this._showDialogHelper(true);
	}

	_showDialogHelper = (show) => {
		$(this.refs.modal).modal({
			backdrop: 'static',
			show: show
		});
	}

	ok = () => {
		$(this.refs.modal).modal('hide');
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		return (
			<div id="bitcoin-address-dialog" class="modal fade" tabIndex="-1" role="dialog" ref="modal" aria-hidden="true" style={{zIndex: 1051}}>
				<form id="bitcoin-address-dialog-form" class="needs-validation" noValidate={true} ref="form">
			 		<div class="modal-dialog" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<h5 class="modal-title">{t.Generic.BitcoinAddress}</h5>
								<button type="button" class="close" onClick={this.ok}>
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div class="modal-body">
								<div class="w-100 text-center">
									<QRCode value={this.state.address} size={256}/>
								</div>
								<div class="w-100 text-center mb-3" style={{wordWrap: "break-word"}}>
									{this.state.address}
								</div>
							</div>
							<div class="modal-footer">
								<button type="button" class="btn btn-primary" onClick={this.ok}>{t.Generic.Ok}</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		);
	}
}