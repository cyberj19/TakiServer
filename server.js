var API = require('./api.js').APIServer;
var Taki = require('./taki/taki.js').Taki;

var taki = new Taki();
var params = {port: 1000};
api = new API(params, taki);
api.start();