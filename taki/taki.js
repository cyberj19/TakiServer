var Game = require('./game.js');
var errors = require('./consts.js').errors;

exports.Taki = function() {

    // TODO: move to consts file
    const playerStates = {
        Idle: 'Idle',
        InGame: 'InGame'
    }

    var players = [];
    var games = [];

    this.registerPlayer = function(params) {
        if (params.name === '')
            return {success: false, error: errors.PLAYER_ILLEGAL_NAME};
            
        var index = players.findIndex(player => player.name === params.name);
        if (index !== -1) return {success: false, error: errors.PLAYER_NAME_EXISTS};

        var newPlayer = {
            name: params.name,
            state: playerStates.Idle
        };

        players.push(newPlayer);
        return {success: true};
    };

    this.removePlayer = function(params) {
        let index = players.findIndex(player => player.name === params.name);
        if (index === -1) return {success: true};

        players.splice(index,1);
        
        for (var game in games) {
            if (game.removePlayer(params.name))
                break;
        }

        return {success: true};
    };

    this.move = function(params) {
        var game = games.find(g => g.name === params.game);
        if (!game) return {success: false, error: errors.GAME_UNKNOWN_NAME};

        return game.move({move: params.move, player: params.player, card: params.card});
    }

    this.getGameView = function(params) {
        var game = games.find(g => g.name === params.game);
        if (!game) return {success: false, error: errors.GAME_UNKNOWN_NAME};

        return {success: true, game: game.getView(params)};
    };

    this.getView = function() {
        var state = {
            success: true,
            games: games.map(g => g.getOverview()),
            players: players
        };

        return state;
    };

    this.createGame = function(params) {
        var index = games.findIndex(game => game.name === params.game);
        if (index !== -1) return {success: false, error: errors.GAME_NAME_EXISTS};

        if (params.required_players < 2 || params.required_players > 4)
            return {success: false, error: errors.GAME_INVALID_NUM_PLAYERS};

        
        var newGame = new Game.Game(params);

        games.push(newGame);
        return {success: true};
    };

    this.joinGame = function(params) {
        var game = games.find(g => g.name === params.game);
        if (!game) return {success: false, error: errors.GAME_UNKNOWN_NAME};
        
        var player = players.find(p => p.name === params.player);
        if (!player) return {success: false, error: errors.PLAYER_UNKNOWN};

        var res = game.add(params);

        if (!res.success) return res;
        
        player.state = playerStates.InGame;
        return res;
    };

    this.leaveGame = function(params) {
        var game = games.find(g => g.name === params.game);
        if (!game) return {success: false, error: errors.GAME_UNKNOWN_NAME};

        var player = players.find(p => p.name === params.player);
        if (!player) return {success: false, error: errors.PLAYER_UNKNOWN};

        var res = game.remove(params.player);
        if (!res.success) return res;

        player.state = playerStates.Idle;
        
        return res;
    };

    this.message = function(params) {
        var game = games.find(g => g.name === params.game);
        if (!game) return {success: false, error: errors.GAME_UNKNOWN_NAME};

        return game.message(params);
    }
}