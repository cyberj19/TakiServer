const consts = require('../taki/consts.js');
const moves = consts.moveTypes;
const Taki = require('../taki/taki.js').Taki;

var taki = new Taki();


taki.registerPlayer({name: 'Tomer'});
taki.registerPlayer({name: 'Jacob'});

taki.createGame({player: 'Tomer', game: 'TomerJacob', required_players: 2});

taki.joinGame({player: 'Tomer', game: 'TomerJacob'});
taki.joinGame({player: 'Jacob', game: 'TomerJacob'});

exports.taki = taki;
exports.getTomerGame = function() {
    return taki.getGameView({player:'Tomer', game:'TomerJacob'});
};

var showCurrent = function() {
    var game = exports.getTomerGame();
    console.log('Player',game.game.players[game.game.board.turn.currentPlayerId].name);
    console.log('Cards:',game.game.players[game.game.board.turn.currentPlayerId].cards);
    console.log('Top:',game.game.board.stack_top);
}
exports.put = function(color,type) {
    var game = exports.getTomerGame();
    var player = game.game.players[game.game.board.turn.currentPlayerId].name;
    var res = taki.move({player:player, game:'TomerJacob',move:moves.Card,card:{color:color,type:type}});
    console.log(res);
    showCurrent();
}


exports.take = function() {
    var game = exports.getTomerGame();
    
    var player = game.game.players[game.game.board.turn.currentPlayerId].name;
    console.log(taki.move({player:player, game:'TomerJacob',move:moves.Take}));
    showCurrent();
}

exports.end = function() {
    var game = exports.getTomerGame();
    
    var player = game.game.players[game.game.board.turn.currentPlayerId].name;
    var res = taki.move({player:player, game:'TomerJacob', move:moves.EndTaki});
    console.log(res);
    showCurrent();

}
showCurrent();