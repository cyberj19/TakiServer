const Game = require('./game.js');
const errors = require('./consts.js').errors;

exports.Taki = function() {

    // TODO: move to consts file
    const playerStates = {
        Idle: 'Idle',
        InGame: 'InGame'
    };

    let players = [];
    let games = [];

    this.registerPlayer = function(params) {
        if (params.name === '')
            return {success: false, error: errors.PLAYER_ILLEGAL_NAME};
            
        const index = players.findIndex(player => player.name === params.name);
        if (index !== -1) return {success: false, error: errors.PLAYER_NAME_EXISTS};

        const newPlayer = {
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
        
        for (let game in games) {
            if (game.removePlayer(params.name))
                break;
        }

        return {success: true};
    };

    this.move = function(params) {
        const game = games.find(g => g.name === params.game);
        if (!game) return {success: false, error: errors.GAME_UNKNOWN_NAME};

        return game.move({move: params.move, player: params.player, card: params.card});
    };

    this.getGameView = function(params) {
        const game = games.find(g => g.name === params.game);
        if (!game) return {success: false, error: errors.GAME_UNKNOWN_NAME};

        return {success: true, game: game.getView(params)};
    };

    this.getView = function() {
        return {
            success: true,
            games: games.map(g => g.getOverview()),
            players: players
        };
    };

    this.createGame = function(params) {
        const index = games.findIndex(game => game.name === params.game);
        if (index !== -1) return {success: false, error: errors.GAME_NAME_EXISTS};

        if (params.required_players < 2 || params.required_players > 4)
            return {success: false, error: errors.GAME_INVALID_NUM_PLAYERS};

        
        const newGame = new Game.Game(params);

        games.push(newGame);

        return {success: true};
    };

    this.joinGame = function(params) {
        const game = games.find(g => g.name === params.game);
        if (!game) return {success: false, error: errors.GAME_UNKNOWN_NAME};
        
        const player = players.find(p => p.name === params.player);
        if (!player) return {success: false, error: errors.PLAYER_UNKNOWN};

        const res = game.add(params);

        if (!res.success) return res;
        
        player.state = playerStates.InGame;
        return res;
    };

    this.leaveGame = function(params) {
        const game = games.find(g => g.name === params.game);
        if (!game) return {success: false, error: errors.GAME_UNKNOWN_NAME};

        const player = players.find(p => p.name === params.player);
        if (!player) return {success: false, error: errors.PLAYER_UNKNOWN};

        const res = game.remove(params.player);
        if (!res.success) return res;

        player.state = playerStates.Idle;
        
        return res;
    };

    this.message = function(params) {
        const game = games.find(g => g.name === params.game);
        if (!game) return {success: false, error: errors.GAME_UNKNOWN_NAME};

        return game.message(params);
    }
};