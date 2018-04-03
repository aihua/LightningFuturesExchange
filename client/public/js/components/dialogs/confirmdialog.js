import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../stores/i18nstore.js'
import ConfirmDialogStore from '../../stores/confirmdialogstore.js'
import * as ConfirmDialogActions from '../../actions/confirmdialogactions.js'


import $ from 'jquery';

export default class ConfirmDialog extends React.Component {
	constructor() {
		super()
	}

	componentWillMount() {
		ConfirmDialogStore.on('openConfirmDialog', this.showDialog);
	}

	componentDidMount() {
		this._showDialogHelper(false);
	}

	componentWillUnmount() {
		ConfirmDialogStore.unbindListener('openConfirmDialog', this.showDialog);
	}

	showDialog = () => {
		this.forceUpdate();
		this._showDialogHelper(true);
	}

	_showDialogHelper = (show) => {
		$(this.refs.modal).modal({
			backdrop: 'static',
			show: show
		});
	}

	yes = () => {
		ConfirmDialogActions.closeConfirmDialog('yes');
		$(this.refs.modal).modal('hide');
	}

	no = () => {
		ConfirmDialogActions.closeConfirmDialog('no');
		$(this.refs.modal).modal('hide');
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		return (
			<div id="areyousuremodel" class="modal fade" tabIndex="-1" role="dialog" ref="modal" aria-hidden="true" style={{zIndex: 1051}}>
				<form id="manageexchangesandwallets" class="needs-validation" noValidate={true} ref="form">
			 		<div class="modal-dialog" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<h5 class="modal-title">{t.Generic[ConfirmDialogStore.title]}</h5>
								<button type="button" class="close" onClick={this.no}>
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div class="modal-body">
								{t.Generic[ConfirmDialogStore.body]}
							</div>
							<div class="modal-footer">
								<button type="button" class="btn btn-primary" onClick={this.yes}>{t.Generic[ConfirmDialogStore.yes]}</button>
								<button type="button" class="btn btn-default" onClick={this.no}>{t.Generic[ConfirmDialogStore.no]}</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		);
	}
}