const Game = require('./game.js');
const errors = require('./consts.js').errors;
const gameStates = require('./consts.js').gameStates;

exports.Taki = function () {

    // TODO: move to consts file
    const playerStates = {
        Idle: 'Idle',
        InGame: 'InGame'
    };

    let players = [];
    let games = [];

    this.registerPlayer = function (params) {
        if (params.name === '')
            return {
                success: false,
                error: errors.PLAYER_ILLEGAL_NAME
            };

        const index = players.findIndex(player => player.name === params.name);
        if (index !== -1) return {
            success: false,
            error: errors.PLAYER_NAME_EXISTS
        };

        const newPlayer = {
            name: params.name,
            state: playerStates.Idle,
            currentGame: null
        };

        players.push(newPlayer);
        return {
            success: true
        };
    };

    this.removePlayer = function (params) {
        let index = players.findIndex(player => player.name === params.name);
        if (index === -1) return {
            success: true
        };

        players.splice(index, 1);

        for (let game of games) {
            if (game.removePlayer(params.name))
                break;
        }

        return {
            success: true
        };
    };


    this.removeGame = function (gameToRemove, creatorName) {
        let index = games.findIndex(game => game.name === gameToRemove);
        if (index === -1) return {success: true};
        let game = games[index];

        if (game.createdBy !== creatorName) 
            return {
                success: false,
                error: errors.GAME_MUST_BE_REMOVED_ONLY_BY_CREATOR
            };
        
        if (game.state !== gameStates.Pending) 
            return {
                success: false,
                error: errors.GAME_CANNOT_REMOVE_WHEN_NOT_PENDING
            };


        for (let player of players) {
            if (player.currentGame === gameToRemove) {
                player.state = playerStates.Idle;
                player.currentGame = null;
            }
        }
        games.splice(index, 1);
        return {success: true};
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

        const res = game.remove(params.player);
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