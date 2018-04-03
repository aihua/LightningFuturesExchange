import React from "react";
import ReactDom from "react-dom";
import { Link } from "react-router-dom";

import I18nStore from '../../../../stores/i18nstore.js'

export default class IndexPageLoggedOut extends React.Component {
	render() {
		const t = I18nStore.getCurrentLanguageJSON();

		return (
			<div class="container-fluid" style={{maxWidth: '1200px'}}>
				<div class="row">
					<div class="col-md-8">
						<div class="fluid-width-video-wrapper">
							<iframe class="fluid-video" src="https://www.youtube.com/embed/aNA7LLy5o2w" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen={true}></iframe>
						</div>						
					</div>
					<div class="col-md-4">
						<h1>{t.Generic.LightningFuturesExchange}</h1>
						<p>{t.Generic.BusinesQuote}</p>
						<div style={{textAlign: 'center'}}>
							<Link class="btn btn-primary btn-lg" to={'/register'}>{t.Generic.RegisterToday}</Link>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-md-12">
						<div class="card text-white bg-secondary text-center">
							<div class="card-body">
								<p class="text-white">{t.Generic.CallToActionCard}</p>
							</div>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-md-4">
						<div class="card">
							<div class="card-body">
								<h2 class="card-title">Card One</h2>
								<p class="card-text">
									Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text 
								</p>
							</div>
						</div>
					</div>
					<div class="col-md-4">
						<div class="card">
							<div class="card-body">
								<h2 class="card-title">Card Two</h2>
								<p class="card-text">
									Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text 
								</p>
							</div>
						</div>
					</div>
					<div class="col-md-4">
						<div class="card">
							<div class="card-body">
								<h2 class="card-title">Card Three</h2>
								<p class="card-text">
									Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text Card Text 
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}