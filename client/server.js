var express = require('express');
var app = express();

require('./routes/i18n.js')(app);

var helpers = require('./helpers/helpers.js')

var _ = require('underscore');
var fs = require('fs');

app.use('/js',  express.static(__dirname + '/public/js'));
app.use('/css',  express.static(__dirname + '/public/css'));
app.use('/images',  express.static(__dirname + '/public/images'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/', express.static(__dirname + '/public'));


var router = express.Router(); 

app.get('/', function (req, res){
    res.send(fs.readFileSync('./public/index.html', 'utf8'));
});

app.use('/api', router);

app.listen(3000, "localhost");
console.log('Listening on port 3000');
