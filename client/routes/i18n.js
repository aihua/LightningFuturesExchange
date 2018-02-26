var express = require('express');
var helpers = require('../helpers/helpers.js')
var fs = require('fs');

var _ = require('underscore')

module.exports = function (app) {
	var router = express.Router();

	router.post('/', function (req, res) {		
		helpers.buildTranslationFiles();
	})

	app.use('/api2/i18n', router);
}