const consts = require('./consts.js');
const errors = consts.errors;
const moveTypes = consts.moveTypes;
const gameStates = consts.gameStates;
const gamePlayerStates = consts.gamePlayerStates;

const Board = require('./board.js');
const GamePlayer = require('./gameplayer.js').GamePlayer;

const INITIAL_CARDS_NUMBER = 8;

exports.Game = function(gameName, creator, requiredPlayers) {
    let me = this;

    me.name = gameName;
    me.createdBy = creator;
    me.state = gameStates.Pending;
    let round = -1;

    let winners = [];
    let players = [];
    let fplayers = [];
    let playersCount = 0;

    let observers = [];
    let messages = [];
    
    let board = Board.GetTakiBoard(requiredPlayers);

    let activePlayers = 0;

    me.getOverview = function() {
        return {
            name: me.name,
            state: me.state,
            players: players.length,
            observers: observers.length,
            required: requiredPlayers,
            created_by: me.createdBy,
            current_round: round
        }
    };
    
    me.getView = function(player) {
        if (me.state === gameStates.Finishing) return getFinishView(player);
        else return getActiveView(player);
    }

    const start = function() {
        winners = [];
        fplayers = [];
        board.resetHeap();
        board.initialize(players.map(p => p.id));
        for (let player of players) {
            player.addCards(board.dealCard(INITIAL_CARDS_NUMBER));
            player.state = gamePlayerStates.Playing;
            if (player.id === board.getCurrentPlayerId())
                player.startTurn();
        }
        activePlayers = players.length;
        round++;
        me.state = gameStates.Active;        
        
        console.log('Game ' + me.name + ' has started');
    };

    const getObserverView = function() {
        let vplayers = null;
        if (me.state === gameStates.Pending) {
            vplayers = players.map(p => {name: p.name});
        } else {
            vplayers = players.map(p => p.getSelfView(board.getCurrentPlayerId()));
        }
        let gameView = {
            name: me.name,
            state: me.state,
            isPlayer: false,

            winners: winners,
            players: vplayers,
            observers: observers,
            messages: messages
        }
        
        let boardView = board.getView();
        if (boardView.initialized) {
            gameView.activeTwo = boardView.take2;
            gameView.heap = boardView.heap;
            gameView.direction = boardView.direction;
            gameView.isTaki = boardView.taki;
        }

        return gameView;
    };

    const getPlayerView = function(player) {
        let currentPlayerId = board.getCurrentPlayerId();
        let playerViews = players.map(p => {
            if (p.name === player) return p.getSelfView(currentPlayerId);
            else return p.getOpponentView(currentPlayerId);
        });

        let gameView = {
            name: me.name,
            state: me.state,
            isPlayer: true,

            winners: winners,
            players: playerViews,
            observers: observers,
            messages: messages
        }
        let boardView = board.getView();
        if (boardView.initialized) {
            gameView = {...gameView, ...boardView};
        }
        return gameView;
    };

    const isPlayerInGame = function(player) {
        let index = players.findIndex(p => p.name === player);
        if (index !== -1) return true;

        index = observers.findIndex(p => p.name === player);
        if (index !== -1) return true;

        return false;
    };

    const getActiveView = function(player) {
        let index = players.findIndex(p => p.name === player);
        if (index === -1) return getObserverView();
        return getPlayerView(player);
    };

    const getFinishView = function(player) {
        return {
            name: me.name,
            round: round,
            players: fplayers,
            winner: winners,
            state: me.state
        };
    };

    const playCard = function(player, cardIndex) {
        let card = player.getCard(cardIndex);
        console.log('[GAME] Card: ' + JSON.stringify(card));
        if (!card) return {success: false, error: errors.MOVE_UNAVAILABLE};

        if (!board.isCardEligible(card)) return {success: false, error: errors.MOVE_ILLEGAL};

        board.placeCard(card);
        player.removeCard(cardIndex);
        return {success: true};
    };

    const takeCard = function(player) {
        if (player.hasEligibleCards(board.getTop(), board.isTake2Mode(),true)) {
            return {success: false, error: errors.MOVE_ELLIGIBLE_CARDS};
        }
        player.addCards(board.takeCard());
        return {success: true};
    };

    const endTaki = function(player) {
        if (!board.isTakiMode()) return {success:false, error: errors.MOVE_ILLEGAL}
        board.endTaki();
        return {success: true};
    };

    me.move = function(params) {
        console.log('[GAME] Move:' + params.move + '; Player:' + params.player);
        let player = players.find(p => p.name === params.player);
        if (!player) return {success:false, error: errors.PLAYER_UNKNOWN};

        if (player.state === me.state.Pending || player.state === me.state.Finished) {
            return {success: false, error: errors.MOVE_PLAYER_NOT_PLAYING};
        }

        if (board.getCurrentPlayerId() !== player.id)
            return {success: false, error: errors.MOVE_NOT_PLAYERS_TURN};

        let result;
        
        if (params.move === moveTypes.Card)
            result = playCard(player, params.card);
        else if (params.move === moveTypes.EndTaki)
            result = endTaki(player);
        else if (params.move === moveTypes.Take)
            result = takeCard(player);
        else 
            return {success: false, error: errors.MOVE_UNAVAILABLE}
        

        if (!result.success) return result;

        player.endTurn();
        triggerNextPlayer();
        handleWinner(player);
        
        return result;
    };

    const handleWinner = function(player) {
        if (!player.hasCards()) {
            playerWin(player); 
            if (activePlayers === 1) { 
                playerWin(players.find(p=>p.state !== gamePlayerStates.Finished));
                me.state = gameStates.Finishing;
            }   
        } 
    }
    const triggerNextPlayer = function() {
        for (let player of players) {
            if (player.id === board.getCurrentPlayerId()) {
                player.startTurn();
                break;
            }
        }
    }
    const playerWin = function(winner) {
        board.removeWinner(winner.id);
        fplayers.push(winner.getSummaryView());
        winner.state = gamePlayerStates.Finished;
        winners.push(winner.name);
        winner.setWin(winners.length);
        activePlayers--;
    }

    me.addPlayer = function(player, asObserver=false) {
        if (me.state !== gameStates.Pending && !asObserver) return {success: false, error: errors.GAME_ALREADY_STARTED};
        if (isPlayerInGame(player)) return {success: false, error: errors.GAME_PLAYER_ALREADY_IN_GAME};
        console.log("asObserver: "+asObserver);
        if (asObserver) {
            observers.push({name: player});
            return {success: true};
        }

        let gamePlayer = new GamePlayer(player, playersCount++, gamePlayerStates.Pending);
        players.push(gamePlayer);
        if (players.length === requiredPlayers) {
            start();
        }
        return {success: true};
    };

    const resetGameStateAndChat = function() {
        if (me.state === gameStates.Finishing && players.length === 0) {
            me.state = gameStates.Pending;
            messages = [];
        }

    }
    const removePlayerAtIndex = function(index) {
        let player = players[index];
        if (player.state === gamePlayerStates.Finished || me.state === gameStates.Pending) {
            players.splice(index, 1);
            resetGameStateAndChat();
            return {success: true};
        }
        return {success: false, error: errors.GAME_CANNOT_LEAVE_WHILE_PLAYING};
    };

    me.removePlayer = function(player) {
        let index = players.findIndex(p => p.name === player);
        if (index !== -1) return removePlayerAtIndex(index);

        index = observers.findIndex(o => o.name === player);
        if (index !== -1) {
            observers.splice(index, 1);
            return {success: true};
        }

        return {success: false, error: errors.PLAYER_UNKNOWN};
    }

    me.message = function(params) {
        let index = players.findIndex(p => p.name === params.player);
        if (index === -1) return {success: false, error: errors.PLAYER_UNKNOWN};

        messages.push({
            sender: params.player,
            text: params.text,
            ts: (new Date()).getTime()
        });

        return {success: true};
    }
}