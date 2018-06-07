const consts = require('../taki/consts.js');
const moves = consts.moveTypes;
const Taki = require('../taki/taki.js').Taki;

var taki = new Taki();


taki.registerPlayer({name: 'Eli'});
taki.registerPlayer({name: 'Jacob'});

taki.createGame({player: 'Eli', game: 'EliJacob', required_players: 2});

taki.joinGame({player: 'Eli', game: 'EliJacob'});
taki.joinGame({player: 'Jacob', game: 'EliJacob'});

exports.taki = taki;
exports.getEliGame = function() {
    return taki.getGameView({player:'Eli', game:'EliJacob'});
};

var showCurrent = function() {
    var game = exports.getEliGame();
    console.log('Player',game.game.players[game.game.board.turn.currentPlayerId].name);
    console.log('Cards:',game.game.players[game.game.board.turn.currentPlayerId].cards);
    console.log('Top:',game.game.board.stack_top);
}
exports.put = function(color,type) {
    var game = exports.getEliGame();
    var player = game.game.players[game.game.board.turn.currentPlayerId].name;
    var res = taki.move({player:player, game:'EliJacob',move:moves.Card,card:{color:color,type:type}});
    console.log(res);
    showCurrent();
}


exports.take = function() {
    var game = exports.getEliGame();
    
    var player = game.game.players[game.game.board.turn.currentPlayerId].name;
    console.log(taki.move({player:player, game:'EliJacob',move:moves.Take}));
    showCurrent();
}

exports.end = function() {
    var game = exports.getEliGame();
    
    var player = game.game.players[game.game.board.turn.currentPlayerId].name;
    var res = taki.move({player:player, game:'EliJacob', move:moves.EndTaki});
    console.log(res);
    showCurrent();

}
showCurrent();