var express = require('express');

var Config = require('../models/config.js')

var Cookies = require('cookies')
var _ = require('underscore');

var Helpers = require('../helpers/helpers.js');

module.exports = function (app) {
	var router = express.Router();

	//check if config exists.
	router.get('/exists', Helpers.default_router_handler(function (req, res) {
		if (!Config.hasConfig()) {
			res.send({
				hasConfig: false,
				config: null
			});
		} else {
			console.log('sessiontoken: ' + req.cookies.sessiontoken);
			if (req.cookies.sessiontoken) {
				var password = Config.getPassword(req.cookies.sessiontoken);
				res.send({
					hasConfig: true,
					config: Config.toSafeConfig(Config.loadConfig(password))
				});
			} else {
				throw 'incorrectPassword';
			}
		}
	}));

	//get viewable config file.
	router.get('/', Helpers.default_router_handler(function (req, res) {
		var password = Config.getPassword(req.cookies.sessiontoken);
		var config = Config.loadConfig(password);
		res.send(Config.toSafeConfig(config));
	}));

	//create a new blank config with password.
	router.post('/', Helpers.default_router_handler(function (req, res) {
		var config = Config.createConfig(req.body.password);
		res.send({
			sessionToken: config.sessionToken,
			config: Config.toSafeConfig(config.config)
		});
	}));

	//add an exchange
	router.post('/exchange', Helpers.default_router_handler(function (req, res) {
		var password = Config.getPassword(req.cookies.sessiontoken);
		var config = Config.addExchange(password, req.body);
		res.send(Config.toSafeConfig(config));
	}));

	//delete an exchange
	router.delete('/exchange/:exchange_name', Helpers.default_router_handler(function (req, res) {
		var password = Config.getPassword(req.cookies.sessiontoken);
		var config = Config.removeExchange(password, req.params.exchange_name);
		res.send(Config.toSafeConfig(config));
	}));

	//rename an exchange
	router.put('/exchange/:exchange_name', Helpers.default_router_handler(function (req, res) {
		var password = Config.getPassword(req.cookies.sessiontoken);
		var config = Config.renameExchange(password, req.params.exchange_name, req.body);
		res.send(Config.toSafeConfig(config));
	}));

	//add an wallet
	router.post('/exchange/:exchange_name/wallet', Helpers.default_router_handler(function (req, res) {
		var password = Config.getPassword(req.cookies.sessiontoken);
		var config = Config.addWallet(password, req.params.exchange_name, req.body);
		res.send(Config.toSafeConfig(config));
	}));

	//delete an wallet
	router.delete('/exchange/:exchange_name/wallet/:wallet_name', Helpers.default_router_handler(function (req, res) {
		var password = Config.getPassword(req.cookies.sessiontoken);
		var config = Config.removeWallet(password, req.params.exchange_name, req.params.wallet_name);
		res.send(Config.toSafeConfig(config));
	}));

	//rename an wallet
	router.put('/exchange/:exchange_name/wallet/:wallet_name', Helpers.default_router_handler(function (req, res) {
		var password = Config.getPassword(req.cookies.sessiontoken);
		var config = Config.renameWallet(password, req.params.exchange_name, req.params.wallet_name, req.body);
		res.send(Config.toSafeConfig(config));
	}));

	app.use('/api/config', router);
}