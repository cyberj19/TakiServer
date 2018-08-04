const consts = require('./consts.js');
const cardTypes = consts.cardTypes;
const cardColors = consts.cardColors;

const cards = require('./cards.js');
const random = require('../utils/random.js');

exports.GetTakiBoard = function(nplayers) {
    const DelearModule = require('./dealer.js');
    let deck = DelearModule.defaultDeck();
    let delear = new DelearModule.Delear(deck,'random');
    return new exports.Board(nplayers, delear);
}

exports.Board = function(nplayers, dealer) {
    let initialized = false;
    let stack = [];
    let direction = 1;
    let currentTurn = 0;
    let lastPlayedCard = null;
    let take2Counter = 0;
    let takiMode = false;
    let numPlayers = nplayers;
    let activePlayersIds = [];

    this.getTop = function() {
        return stack[stack.length - 1];
    }; 

    this.removeWinner = function(winnerId) {
        let currentPlayerId = this.getCurrentPlayerId();
        let index = activePlayersIds.indexOf(winnerId);
        activePlayersIds.splice(index,1);
        currentTurn = activePlayersIds.indexOf(currentPlayerId);
    };

    this.getCurrentPlayerId = function() {
        return activePlayersIds[currentTurn];
    };

    this.getView = function() {
        if (!initialized) return {initialized: false};
        return {
            initialized: true,
            deck_empty: dealer.isEmpty(),
            stack_top: this.getTop(),
            turn: {
                currentPlayerId: activePlayersIds[currentTurn],
                direction: direction
            },
            special_modes: {
                take2: take2Counter,
                taki: takiMode
            }
        };
    };

    this.initialize = function(playerIds) {
        stack.push(dealer.getFirstCard());
        activePlayerIds = playerIds;
        initialized = true;
    };

    const resetDelear = function() {
        temp = stack.pop();
        dealer.returnCards(stack);
        stack = [temp];
    };

    const getCards = function(n) {
        var newCards = [];
        for (let i = 0; i < n; i++) {
            if (dealer.isEmpty()) resetDelear();
            newCards.push(dealer.getCard());
        }
        return newCards;
    }
    this.isTakiMode = function() {return takiMode;}

    this.dealCard = function(n) {
        var cardsToDraw = 1;
        if (n) {
            cardsToDraw = n;
        } else if (take2Counter > 0) {
            cardsToDraw = take2Counter;
        }
        return getCards(cardsToDraw);
    };

    this.isCardElligible = function(card) {
        return cards.isElligible(card, this.getTop());
    };

    this.takeCard = function() {
        let cards = this.dealCard();
        endTurn();
        return cards;
    }
    this.placeCard = function(card) {
        stack.push(card);
        lastPlayedCard = card;
        endTurn();
    };

    this.endTaki = function() {
        takiMode = false;
        endTurn();
    }

    const advanceTurn = function() {
        currentTurn += direction;
        currentTurn = (currentTurn + activePlayersIds.length) % activePlayersIds.length;  
    };

    const endTurn = function() {
        // if (!lastPlayedCard)
        //     return advanceTurn();
        
        if (lastPlayedCard.type === cardTypes.ChangeDirection) {
            direction *= -1;
        }
        
        if (cards.isTaki(lastPlayedCard)) {
            takiMode = true;
        }
        else if (lastPlayedCard.type !== cardTypes.Plus && !takiMode) {
            if (lastPlayedCard.type === cardTypes.Stop) currentTurn += direction;
            if (lastPlayedCard.type === cardTypes.Take2) take2Counter += 2;
            advanceTurn();    
        }

        if (!takiMode)
            lastPlayedCard = null;
    };
};