const consts = require('./consts.js');
const cardTypes = consts.cardTypes;
const cardColors = consts.cardColors;

const cards = require('./cards.js');
const random = require('../utils/random.js');

exports.GetTakiBoard = function (nplayers) {
    const DelearModule = require('./dealer.js');
    let deck = DelearModule.defaultDeck();
    let delear = new DelearModule.Delear(deck, 'random');
    return new exports.Board(nplayers, delear);
}

exports.Board = function (nplayers, dealer) {
    let me = this;

    let initialized = false;
    let heap = [];
    let direction = 1;
    let currentTurn = 0;
    let lastPlayedCard = null;
    let take2Counter = 0;
    let takiMode = false;
    let activePlayersIds = [];

    me.getTop = function () {
        return heap[heap.length - 1];
    };

    me.removeWinner = function (winnerId) {
        let currentPlayerId = me.getCurrentPlayerId();
        let index = activePlayersIds.indexOf(winnerId);
        activePlayersIds.splice(index, 1);
        currentTurn = activePlayersIds.indexOf(currentPlayerId);
    };

    me.getCurrentPlayerId = function () {
        return activePlayersIds[currentTurn];
    };

    me.getView = function () {
        if (!initialized) return {
            initialized: false
        };
        return {
            initialized: true,
            heap: heap,
            direction: direction,
            activeTwo: take2Counter,
            isTaki: takiMode,
            take2: take2Counter>0
        };
    };

    me.initialize = function (playerIds) {
        heap.push(dealer.getFirstCard());
        activePlayersIds = playerIds;
        currentTurn = 0;
        initialized = true;
    };

    me.resetHeap = function(){
        heap=[];
    }
    const resetDealer = function () {
        temp = heap.pop();
        dealer.returnCards(heap);
        heap = [temp];
    };

    const getCards = function (n) {
        var newCards = [];
        for (let i = 0; i < n; i++) {
            if (dealer.isEmpty()) resetDealer();
            newCards.push(dealer.getCard());
        }
        return newCards;
    }
    me.isTakiMode = function () {
        return takiMode;
    }
    me.isTake2Mode = function () {
        return take2Counter > 0;
    }

    const endTake2 = function () {
        take2Counter = 0;
        lastPlayedCard = null;
    };

    me.dealCard = function (n) {
        var cardsToDraw = 1;
        if (n) {
            cardsToDraw = n;
        } else if (me.isTake2Mode()) {
            cardsToDraw = take2Counter;
        }
        return getCards(cardsToDraw);
    };

    me.isCardEligible = function (card) {
        return cards.isEligible(card, me.getTop(), me.isTake2Mode());
    };

    me.takeCard = function () {
        let cards = me.dealCard();
        endTake2();
        endTurn();
        return cards;
    }

    me.placeCard = function (card) {
        if (!card.wasSuperTaki) {
            if (cards.isTaki(card)) {
                takiMode = true;
            }
            heap.push(card);
            lastPlayedCard = card;
        } else {
            let newcard = {
                type: card.type,
                color: me.getTop().color,
                wasSuperTaki: true
            };
            heap.push(newcard);
            lastPlayedCard = card;
            takiMode = true;
        }
        endTurn();
    };

    me.endTaki = function () {
        takiMode = false;
        endTurn();
        lastPlayedCard = null;
    };

    const advanceTurn = function (turnsToAdvance) {
        currentTurn += turnsToAdvance*direction;
        currentTurn = (currentTurn + activePlayersIds.length) % activePlayersIds.length;
        console.log("current turn is "+currentTurn);
    };

    const handleSpecialCards = function() {
        let turnsToAdvance = 1;
        if (lastPlayedCard) {
            let type = lastPlayedCard.type;
            if (type === cardTypes.ChangeDirection) {
                direction *= -1;
                console.log('[BOARD] Change direction');
            }
            if (type === cardTypes.Stop) {
                turnsToAdvance = 2;
                console.log('[BOARD] Stop: advance twice');
            }
            if (type === cardTypes.Take2) {
                take2Counter += 2;
                console.log('[BOARD] Increase take 2 counter');
            }
            if (type === cardTypes.Plus) {
                console.log('[BOARD] Plus: dont advance');
                turnsToAdvance = 0;
            }
        } 
        return turnsToAdvance;
    }
    const endTurn = function () {
        if(takiMode) return;
        let turnsToAdvance = handleSpecialCards();
        console.log("[BOARD] Advance turn: "+turnsToAdvance);
        advanceTurn(turnsToAdvance);
        
    };
};