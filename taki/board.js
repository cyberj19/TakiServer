const consts = require('./consts.js');
const cardTypes = consts.cardTypes;
const cardColors = consts.cardColors;

const cards = require('./cards.js');
const random = require('../utils/random.js');

exports.Board = function(nplayers) {
    var initialized = false;
    var deck = [];
    var stack = [];
    var direction = 1;
    var currentTurn = 0;
    var lastPlayedCard = null;
    var take2Counter = 0;
    var takiMode = false;
    var numPlayers = nplayers;
    var activePlayersIds = [];

    this.getTop = function() {
        return stack[stack.length - 1];
    }; 

    this.removePlayer = function(playerId) {
        var index = activePlayersIds.indexOf(playerId);
        activePlayersIds.splice(index,1);
        currentTurn = index % activePlayersIds.length;
    };

    this.getCurrentPlayerId = function() {
        return activePlayersIds[currentTurn];
    };

    this.getView = function() {
        if (!initialized) return {};
        return {
            deck_size: deck.length,
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

    var populateDeck = function() {
        for (let i = 0; i < 4; i++) 
        deck.push({type: cardTypes.Color, color: cardColors.None});

        var coloredCardsTypes = [cardTypes.One, cardTypes.Take2, cardTypes.Three, cardTypes.Four, cardTypes.Five, 
                            cardTypes.Six, cardTypes.Seven, cardTypes.Eight, cardTypes.Nine,
                            cardTypes.Taki, cardTypes.Stop, cardTypes.Plus,
                            cardTypes.ChangeDirection];

        for (let color in cardColors) {
            if (cardColors[color] === cardColors.None) continue;

            for (let i = 0; i < coloredCardsTypes.length; i++) {
                let newCard = {
                    color: cardColors[color],
                    type: coloredCardsTypes[i]
                };
                deck.push(newCard);
                deck.push(newCard);

            }
        }

        deck.push({color: cardColors.None, type: cardTypes.SuperTaki});
        deck.push({color: cardColors.None, type: cardTypes.SuperTaki});
    };

    var openFirstCard = function() {
        var firstCard = deck.splice(randomCard(), 1);
        firstCard = firstCard[0];
        if (firstCard.type === cardTypes.SuperTaki ||
            firstCard.type === cardTypes.Color) {
                let color = random.randomKey(cardColors);
                firstCard.color = cardColors[color];
            }

        stack.push(firstCard);
    };
    this.initialize = function() {
        deck = [];
        populateDeck();
        openFirstCard();
        for (let i = 0; i < numPlayers; i++) activePlayersIds.push(i);
        initialized = true;
    };

    var randomCard = function() {
        return random.randomIndex(deck);
    };

    this.isTakiMode = function() {return takiMode;}

    this.dealCard = function(n) {
        var cardsToDraw = 1;
        if (n) {
            cardsToDraw = n;
        } else if (take2Counter > 0) {
            cardsToDraw = take2Counter;
        }

        var newCards = [];
        for (let i = 0; i < cardsToDraw; i++) {
            let newCard = deck.splice(randomCard(),1);
            newCards.push(newCard[0]);
        }
        return newCards;
    };

    this.isCardElligible = function(card) {
        return cards.isElligible(card, this.getTop());
    };

    this.placeCard = function(card) {
        stack.push(card);
        lastPlayedCard = card;
    };

    this.endTaki = function() {
        takiMode = false;
        // lastPlayedCard = null; // todo: not good for stop card, +2
    }

    var advanceTurn = function() {
        currentTurn += direction;
        currentTurn = (currentTurn + activePlayersIds.length) % activePlayersIds.length;  
    };

    this.endTurn = function() {
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