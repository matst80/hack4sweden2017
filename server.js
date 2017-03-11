var express = require('express');
//var server = express.createServer();
// express.createServer()  is deprecated. 
var server = express(); // better instead
server.configure(function() {
    server.use('/media', express.static(__dirname + '/media'));
    server.use(express.static(__dirname + '/public'));
});

server.listen(80);