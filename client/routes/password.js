var express = require('express');

var Config = require('../models/config.js');
var Helpers = require('../helpers/helpers.js');

module.exports = function (app) {
	var router = express.Router();

	router.get('/:guid',function (req, res) {
		res.send(Config.getPassword(req.params.guid));
	});

	router.post('/', Helpers.default_router_handler(function (req, res) {
		res.send(Config.checkPassword(req.body.password));
	}));

	app.use('/api/password', router);
}