var _ = require('underscore');

var express = require('express');
var app = express();

require('./routes/order.js')(app);

var router = express.Router(); 

app.use('/api', router);

app.listen(1337, "localhost");
console.log('Listening on port 1337');
