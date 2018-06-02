const consts = require('./consts.js');
const errors = consts.errors;
const moveTypes = consts.moveTypes;
const gameStates = consts.gameStates;

const Board = require('./board.js').Board;
const GamePlayer = require('./gameplayer.js').GamePlayer;

exports.Game = function(params) {
    this.name = params.game;
    var state = gameStates.PENDING;

    var createdBy = params.player;

    var players = [];
    var observers = [];
    
    var board = new Board();

    var requiredPlayers = params.required_players;


    this.getOverview = function() {
        return {
            name: this.name,
            state: this.state,
            players: players.length,
            observers: observers.length,
            required: requiredPlayers,
            created_by: createdBy
        }
    };

    var start = function() {
        board.initialize();
        players.forEach(function(player) {
            const numCards = 6;
            for (let i = 0; i < numCards; i++) {
                player.addCard(board.dealCard());
            }
        });
        this.state = gameStates.ACTIVE;        
    };

    var getObserverView = function() {
        let vplayers = null;
        if (state === gameStates.PENDING) {
            vplayers = players.map(p => {name: p.name});
        } else {
            vplayers = players.map(p => p.getView());
        }

        return {
            name: this.name,
            state: state,
            board: board.getView(),
            players: vplayers,
            observers: observers
        };
    };

    var getPlayerView = function(player) {
        var player = players.find(p => p.name === player);

        return {
            name: this.name,
            state: state,
            board: board.getView(),
            player: player.getView(),
            observers: observers
        }
    };

    var playerInGame = function(player) {
        var index = players.findIndex(p => p.name === player);
        if (index !== -1) return true;

        index = observers.findIndex(p => p.name === player);
        if (index !== -1) return true;

        return false;
    };

    this.getView = function(player) {
        var index = players.findIndex(p => p.name === player);
        if (index === -1) return getObserverView();
        return getPlayerView(player);
    }

    this.playCard = function(player, card) {
        var player = player.find(p => p.name === params.player);
        if (!player) return {success: false, error: errors.PLAYER_UNKNOWN};

        var card = player.getCard(params.card);
        if (!card) return {success: false, error: errors.CARD_UNKNOWN};

        if (!board.validateMove(card)) return {success: false, error: errors.MOVE_ILLEGAL};

        board.makeMove(card);
        board.getNextTurn();
        return {success: true};
    };



    var takeCard = function(player) {
        if (player.hasElligibleCards(board.getTop())) return {success:false, error: errors.MOVE_ELLIGIBLE_CARDS};

        var cards = board.dealCard();
        player.cards.push(cards);
        board.getNextTurn();

        return {success: true};
    };

    var endTaki = function(player) {
        if (!board.isTakiMode()) return {success:false, error: errors.MOVE_ILLEGAL}
        board.endTaki();
        board.getNextTurn();
        return {success: true};
    };

    this.playerMove = function(params) {
        var player = players.find(p => p.name === params.player);
        if (!player) return {success:false, error: errors.PLAYER_UNKNOWN};
        if (params.move === moveTypes.Card)
            return playCard(player, params.card);
        else if (params.move === moveTypes.EndTaki)
            return endTaki(player);
        else if (params.move === moveTypes.Take)
            return takeCard(player);
        else 
            return {success: false, error: errors.MOVE_UNKNOWN}
    };

    this.addPlayer = function(params) {
        if (this.state === gameStates.ACTIVE) return {success: false, error: errors.GAME_ALREADY_STARTED};
        if (playerInGame(params.player)) return {success: false, error: errors.GAME_PLAYER_ALREADY_IN_GAME};

        if (params.asObserver) {
            observers.push({name: params.player});
            return {success: true};
        }

        players.push(new GamePlayer(params.player, players.length));
        if (players.length === requiredPlayers) {
            start();
        }
        return {success: true};
    };

    this.removePlayer = function(params) {
        // TODO : check if game started
        var index = players.findIndex(p => p.name === params.player);
        if (index !== -1) {
            players.splice(index,1);
            return true;
        }

        index = observers.findIndex(p => p.name === params.player);
        if (index !== -1) {
            observers.splice(index, 1);
            return true;
        }

        return false;
    }
}