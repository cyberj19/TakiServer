const API = require('./api.js').APIServer;
const Taki = require('../taki/taki.js').Taki;


let taki = new Taki();
const params = {port: 9229};
let api = new API(params, taki);
api.start();