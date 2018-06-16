const consts = require('./consts.js');
const errors = consts.errors;
const moveTypes = consts.moveTypes;
const gameStates = consts.gameStates;
const playerStates = consts.playerStates;

const Board = require('./board.js');
const GamePlayer = require('./gameplayer.js').GamePlayer;

exports.Game = function(params) {
    this.name = params.game;
    var createdBy = params.player;
    var state = gameStates.Pending;
    var round = -1;

    var winners = [];
    var players = [];
    var playersCount = 0;

    var observers = [];
    var messages = [];
    
    var board = Board.GetTakiBoard(params.required_players);

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
        board.initialize(players.map(p => p.id));
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
            vplayers = players.map(p => p.getSelfView(board.getCurrentPlayerId()));
        }

        return {
            name: this.name,
            state: state,

            activeTwo: boardView.special_modes.take2,
            heap: [boardView.stack_top],
            direction: boardView.turn.direction,
            isTaki: boardView.special_modes.taki,

            players: vplayers,
            observers: observers,
            messages: messages
        };
    };

    var getPlayerView = function(player) {
        var currentPlayerId = board.getCurrentPlayerId();
        var playerViews = players.map(p => function() {
            if (p.name === player) return p.getSelfView(currentPlayerId);
            else return p.getOpponentView(currentPlayerId);
        });

        var boardView = board.getView();
        return {
            name: this.name,
            state: state,

            activeTwo: boardView.special_modes.take2,
            heap: [boardView.stack_top],
            direction: boardView.turn.direction,
            isTaki: boardView.special_modes.taki,
            
            winners: winners,
            players: playerViews,
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
        return {
            name: this.name,
            round: round,
            players: players.map(p => p.getSummaryView()),
            winner: winners
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

        player.addCards(board.takeCard());
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
            playerWin(player); 
            if (activePlayers === 1) { 
                playerWin(players.find(p=>p.state !== playerStates.Finished));
                state = gameState.Finishing;
            }   
        } 
        
        return result;
    };

    var playerWin = function(winner) {
        board.removeWinner(winner.id);
        winner.state = playerStates.Finished;
        winners.push(winner.name);
        winner.setWinner(winners.length);
        activePlayers--;
    }

    this.add = function(params) {
        if (state !== gameStates.Pending) return {success: false, error: errors.GAME_ALREADY_STARTED};
        if (isPlayerInGame(params.player)) return {success: false, error: errors.GAME_PLAYER_ALREADY_IN_GAME};

        if (params.asObserver) {
            observers.push({name: params.player});
            return {success: true};
        }

        let gamePlayer = new GamePlayer(params.player, playersCount++, playerStates.Pending);
        players.push(gamePlayer);
        if (players.length === requiredPlayers) {
            start();
        }
        return {success: true};
    };

    var removePlayer = function(index) {
        var player = players[index];
        if (player.state === playerStates.Finished || state === gameStates.Pending) {
            players.splice(index, 1);
            return {success: true};
        }
        return {success: false, error: errors.GAME_CANNOT_LEAVE_WHILE_PLAYING};
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