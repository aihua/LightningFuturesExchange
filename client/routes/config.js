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
			if (req.cookies.sessiontoken) {
				var password = Config.getPassword(req.cookies.sessiontoken);

				console.log(Config.loadConfig(password));

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

	//create a new blank config with password.
	router.put('/', Helpers.default_router_handler(function (req, res) {
		var password = Config.getPassword(req.cookies.sessiontoken);

		var config = Config.toSafeConfig(req.body);
		res.send(Config.saveConfig(password, config));
	}));

	app.use('/api/config', router);
}