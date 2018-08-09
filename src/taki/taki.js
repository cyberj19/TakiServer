const Game = require('./game.js');

const consts = require('./consts.js');
const errors = consts.errors;
const gameStates = consts.gameStates;
const playerStates = consts.playerStates;

exports.Taki = function () {
    let players = [];
    let games = [];

    this.registerPlayer = function (player, callback) {
        if (player === '') return callback(errors.PLAYER_ILLEGAL_NAME);

        const index = players.findIndex(p => p.name === player);
        if (index !== -1) return callback(errors.PLAYER_NAME_EXISTS);

        const newPlayer = {
            name: player,
            state: playerStates.Idle,
            currentGame: null,
            lastKeepAlive: Date.now()
        };

        players.push(newPlayer);
        callback();
    };

    this.removePlayer = function (player) {
        let index = players.findIndex(p => p.name === player);
        if (index === -1) return {success: true};

        players.splice(index, 1);

        for (let game of games) {
            if (game.removePlayer(player))
                break;
        }

        return {success: true};
    };


    this.removeGame = function (gameToRemove, creatorName, callback) {
        let index = games.findIndex(game => game.name === gameToRemove);
        if (index === -1) return callback();

        let game = games[index];

        if (game.createdBy !== creatorName) 
            return callback(errors.GAME_MUST_BE_REMOVED_ONLY_BY_CREATOR);
        
        if (game.state !== gameStates.Pending) 
            return callback(errors.GAME_CANNOT_REMOVE_WHEN_NOT_PENDING);

        for (let player of players) {
            if (player.currentGame === gameToRemove) {
                player.state = playerStates.Idle;
                player.currentGame = null;
            }
        }
        games.splice(index, 1);
        return callback();
    }


    this.move = function (params) {
        const game = games.find(g => g.name === params.game);
        if (!game) return {
            success: false,
            error: errors.GAME_UNKNOWN_NAME
        };

        return game.move({
            move: params.move,
            player: params.player,
            card: params.card
        });
    };

    const getGameView = function (gameName, playerName) {
        const game = games.find(g => g.name === gameName);

        return {
            success: true,
            state: playerStates.InGame,
            game: game.getView(playerName)
        };
    };

    const getPlayerView = function (playerName) {
        const player = players.find(p => p.name === playerName);
        if (!player) return getMainView();
        if (player.state === playerStates.Idle) {
            return getMainView();
        }
        return getGameView(player.currentGame, playerName);

    }
    this.getView = function (playerName) {
        if (playerName) {
            return getPlayerView(playerName);
        } else {
            return getMainView();
        }
    }

    const getMainView = function () {
        return {
            success: true,
            games: games.map(g => g.getOverview()),
            players: players,
            state: playerStates.Idle
        };
    };

    this.createGame = function (params) {
        const index = games.findIndex(game => game.name === params.game);
        if (index !== -1) return {
            success: false,
            error: errors.GAME_NAME_EXISTS
        };
        const player = players.find(p => p.name === params.player);
        if (!player) return {
            success: false,
            error: errors.PLAYER_UNKNOWN
        };

        if (params.required_players < 2 || params.required_players > 4)
            return {
                success: false,
                error: errors.GAME_INVALID_NUM_PLAYERS
            };


        const newGame = new Game.Game(params.game, params.player, params.required_players);

        games.push(newGame);

        return {
            success: true
        };
    };

    this.joinGame = function (params) {
        const game = games.find(g => g.name === params.game);
        if (!game) return {
            success: false,
            error: errors.GAME_UNKNOWN_NAME
        };

        const player = players.find(p => p.name === params.player);
        if (!player) return {
            success: false,
            error: errors.PLAYER_UNKNOWN
        };

        const res = game.addPlayer(params.player, params.asObserver);

        if (!res.success) return res;

        player.state = playerStates.InGame;
        player.currentGame = game.name;
        return res;
    };

    this.leaveGame = function (params) {
        const game = games.find(g => g.name === params.game);
        if (!game) return {
            success: false,
            error: errors.GAME_UNKNOWN_NAME
        };

        const player = players.find(p => p.name === params.player);
        if (!player) return {
            success: false,
            error: errors.PLAYER_UNKNOWN
        };

        const res = game.removePlayer(params.player);
        if (!res.success) return res;

        player.state = playerStates.Idle;
        player.currentGame = null;
        return res;
    };

    this.message = function (params) {
        const game = games.find(g => g.name === params.game);
        if (!game) return {
            success: false,
            error: errors.GAME_UNKNOWN_NAME
        };

        return game.message(params);
    }
};