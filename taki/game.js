const consts = require('./consts.js');
const errors = consts.errors;
const moveTypes = consts.moveTypes;
const gameStates = consts.gameStates;
const playerStates = consts.playerStates;

const Board = require('./board.js').Board;
const GamePlayer = require('./gameplayer.js').GamePlayer;

exports.Game = function(params) {
    this.name = params.game;
    var state = gameStates.Pending;
    var round = -1;
    var winners = [];

    var createdBy = params.player;

    var players = [];
    var observers = [];
    var messages = [];
    
    var board = new Board(params.required_players);

    var requiredPlayers = params.required_players;
    var activePlayers = 0;

    this.getOverview = function() {
        return {
            name: this.name,
            state: state,
            players: players.length,
            observers: observers.length,
            required: requiredPlayers,
            created_by: createdBy,
            current_round: round
        }
    };
    
    this.getView = function(player) {
        if (state === gameStates.Finishing) return getFinishView(player);
        else return getActiveView(player);
    }

    var start = function() {
        board.initialize();
        for (let player of players) {
            player.addCards(board.dealCard(8));
            player.state = playerStates.Playing;
        }
        activePlayers = players.length;
        round++;
        state = gameStates.Active;        
    };

    var getObserverView = function() {
        let vplayers = null;
        if (state === gameStates.Pending) {
            vplayers = players.map(p => {name: p.name});
        } else {
            vplayers = players.map(p => p.getView(board.getCurrentPlayerId()));
        }

        return {
            name: this.name,
            state: state,
            board: board.getView(),
            players: vplayers,
            observers: observers,
            messages: messages
        };
    };

    var getPlayerView = function(player) {
        var player = players.find(p => p.name === player);

        return {
            name: this.name,
            state: state,
            board: board.getView(),
            player: player.getView(board.getCurrentPlayerId()),
            observers: observers,
            messages: messages
        };
    };

    var isPlayerInGame = function(player) {
        var index = players.findIndex(p => p.name === player);
        if (index !== -1) return true;

        index = observers.findIndex(p => p.name === player);
        if (index !== -1) return true;

        return false;
    };

    var getActiveView = function(player) {
        var index = players.findIndex(p => p.name === player);
        if (index === -1) return getObserverView();
        return getPlayerView(player);
    };

    var getFinishView = function(player) {
        if (state !== gameStates.Finishing) 
            return {success: false, error : errors.GAME_STILL_ONGOING};
        
        return {
            name: this.name,
            round: round,
            players: players.map(p => p.getSummaryView())
        };
    };

    var playCard = function(player, card) {
        var card = player.getCard(card);
        if (!card) return {success: false, error: errors.MOVE_UNAVAILABLE};

        if (!board.isCardElligible(card)) return {success: false, error: errors.MOVE_ILLEGAL};

        board.placeCard(card);
        player.removeCard(card);
        return {success: true};
    };

    var takeCard = function(player) {
        if (player.hasElligibleCards(board.getTop())) 
            return {success: false, error: errors.MOVE_ELLIGIBLE_CARDS};

        var cards = board.dealCard();
        console.log(cards);
        player.addCards(cards);
        return {success: true};
    };

    var endTaki = function(player) {
        if (!board.isTakiMode()) return {success:false, error: errors.MOVE_ILLEGAL}
        board.endTaki();
        return {success: true};
    };

    this.move = function(params) {
        console.log('game.playerMove: ' + params);
        var player = players.find(p => p.name === params.player);
        if (!player) return {success:false, error: errors.PLAYER_UNKNOWN};

        if (player.state === state.Pending || player.state === state.Finished) {
            return {success: false, error: errors.MOVE_PLAYER_NOT_PLAYING};
        }

        if (board.getCurrentPlayerId() !== player.id)
            return {success: false, error: errors.MOVE_NOT_PLAYERS_TURN};

        var result;
        if (params.move === moveTypes.Card)
            result = playCard(player, params.card);
        else if (params.move === moveTypes.EndTaki)
            result = endTaki(player);
        else if (params.move === moveTypes.Take)
            result = takeCard(player);
        else 
            return {success: false, error: errors.MOVE_UNAVAILABLE}

        if (!result.success) return result;        
        if (!player.hasCards()) {
            board.removePlayer(player.id);
            player.state = playerStates.Finished;
            activePlayers--;
            if (activePlayers === 1) { // TODO: find last player
                state = gameState.Finishing;
            }
        } else {
            board.endTurn();
        }
        return result;
    };

    this.add = function(params) {
        if (state !== gameStates.Pending) return {success: false, error: errors.GAME_ALREADY_STARTED};
        if (isPlayerInGame(params.player)) return {success: false, error: errors.GAME_PLAYER_ALREADY_IN_GAME};

        if (params.asObserver) {
            observers.push({name: params.player});
            return {success: true};
        }

        let gamePlayer = new GamePlayer(params.player, players.length, playerStates.Pending);
        players.push(gamePlayer);
        if (players.length === requiredPlayers) {
            start();
        }
        return {success: true};
    };

    var removePlayer = function(index) {
        var player = players[index];
        if (player.state === playerStates.Finished) {
            players.splice(index, 1);
            return {success: true};
        }
        if (state === gameStates.Finishing || state === gameStates.Pending) {
            players.splice(index, 1);

            if (state === gameStates.Finishing && players.length === 0) {
                state = gameStates.Pending;
            }

            return {success: true};
        }
        // TODO : return success false with error
    };

    this.remove = function(params) {
        var index = players.findIndex(p => p.name === params.player);
        if (index !== -1) return removePlayer(index);

        index = observers.findIndex(o => o.name === params.player);
        if (index !== -1) {
            observers.splice(index, 1);
            return {success: true};
        }

        return {success: false, error: errors.PLAYER_UNKNOWN};
    }

    this.message = function(params) {
        var index = players.findIndex(p => p.name === params.player);
        if (index === -1) return {success: false, error: errors.PLAYER_UNKNOWN};

        messages.push({
            sender: player,
            text: params.text,
            ts: (new Date()).getTime()
        });

        return {success: true};
    }
}