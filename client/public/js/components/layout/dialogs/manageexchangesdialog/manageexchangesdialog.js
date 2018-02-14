import React from "react";
import ReactDom from "react-dom";

import I18nStore from '../../../../stores/i18nstore.js'

export default class ManageExchangesDialog extends React.Component {
	constructor() {
		super()
	}

	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		return (
			<div id="manageexchangesmodal" class="modal fade" tabIndex="-1" role="dialog" ref="modal" aria-hidden="true">
				<form id="manageexchanges" class="needs-validation" noValidate={true} ref="form">
			 		<div class="modal-dialog" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<h5 class="modal-title">{t.Generic.ManageExchanges}</h5>
								<button type="button" class="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div class="modal-body">
								{t.Generic.ManageExchanges}
							</div>
							<div class="modal-footer">
								<button type="submit" class="btn btn-primary">{t.Generic.Save}</button>
								<button type="submit" class="btn btn-default" data-dismiss="modal" aria-label="Close">{t.Generic.Cancel}</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		);
	}
}