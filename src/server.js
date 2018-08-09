const API = require('./api.js').APIServer;
const Taki = require('./taki/taki.js').Taki;


let taki = new Taki();
let port = process.env.PORT || 9999;
const params = {port: port};
let api = new API(params, taki);
api.start();