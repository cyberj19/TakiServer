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
    let me = this;

    let initialized = false;
    let stack = [];
    let direction = 1;
    let currentTurn = 0;
    let lastPlayedCard = null;
    let take2Counter = 0;
    let takiMode = false;
    let numPlayers = nplayers;
    let activePlayersIds = [];

    me.getTop = function() {
        return stack[stack.length - 1];
    }; 

    me.removeWinner = function(winnerId) {
        let currentPlayerId = me.getCurrentPlayerId();
        let index = activePlayersIds.indexOf(winnerId);
        activePlayersIds.splice(index,1);
        currentTurn = activePlayersIds.indexOf(currentPlayerId);
    };

    me.getCurrentPlayerId = function() {
        return activePlayersIds[currentTurn];
    };

    me.getView = function() {
        if (!initialized) return {initialized: false};
        return {
            initialized: true,
            // isDeckEmpty: dealer.isEmpty(),
            // heap: [me.getTop()],
            heap: stack,
            direction: direction,
            activeTwo: take2Counter,
            isTaki: takiMode
        };
    };

    me.initialize = function(playerIds) {
        stack.push(dealer.getFirstCard());
        activePlayersIds = playerIds;
        currentTurn = 0;
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
    me.isTakiMode = function() {return takiMode;}

    me.dealCard = function(n) {
        var cardsToDraw = 1;
        if (n) {
            cardsToDraw = n;
        } else if (take2Counter > 0) {
            cardsToDraw = take2Counter;
        }
        return getCards(cardsToDraw);
    };

    me.isCardElligible = function(card) {
        return cards.isElligible(card, me.getTop());
    };

    me.takeCard = function() {
        let cards = me.dealCard();
        lastPlayedCard=me.getTop();
        endTurn();
        return cards;
    }
    me.placeCard = function(card) {
        stack.push(card);
        lastPlayedCard = card;
        endTurn();
    };

    me.endTaki = function() {
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