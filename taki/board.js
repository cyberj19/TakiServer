const consts = require('./consts.js');
const cardTypes = consts.cardTypes;
const cardColors = consts.cardColors;

exports.Board = function(nplayers) {
    var initialized = false;
    var deck = [];
    var stack = [];
    var direction = 1;
    var currentTurn = 0;
    var card_played = null;
    var take2_counter = 0;
    var taki_mode = false;
    var numPlayers = nplayers;

    var getTop = function() {
        return stack[stack.length - 1];
    }; 

    this.getView = function() {
        if (!initialized) return {};
        return {
            deck_size: deck.length,
            stack_top: getTop(),
            take2: take2_counter,
            turn: {
                current: currentTurn,
                direction: direction
            },
            special_modes: {
                take2: take2_counter,
                taki: taki_mode
            }
        };
    };

    this.initialize = function() {
        deck = [];
        for (let i = 0; i < 4; i++) deck.push({type: cardTypes.SwitchColor, color: cardColors.None});

        // insert plus
        coloredCardsTypes = [cardTypes.One, cardTypes.Take2, cardTypes.Three, cardTypes.Four, cardTypes.Five, 
                            cardTypes.Six, cardTypes.Seven, cardTypes.Eight, cardTypes.Nine,
                            cardTypes.Taki, cardTypes.Stop, cardTypes.Plus,
                            cardTypes.ChangeDirection];

        cardColors.ForEach(function(color) {
            coloredCardTypes.ForEach(function(type) {
                let newCard = {color: color, type: type};
                deck.push(newCard);
                deck.push(newCard);
            });
        });

        deck.push({color: cardColors.None, type: cardTypes.SuperTaki});
        deck.push({color: cardColors.None, type: cardTypes.SuperTaki});


        var firstCard = deck.splice(randomCard(), 1);
    };

    var randomCard = function() {
        return Math.floor(Math.random()*deck.length);
    };

    this.dealCard = function() {
        var newCards = [];
        for (let i = 0; i < take2_counter; i++) {
            let newCard = deck.splice(randomCard(),1);
            newCards.push(newCard);
        }
        return newCards;
    };

    this.validateMove = function(card) {
        var topCard = getTop();
        if (card.type === cardTypes.SwitchColor) return true;

        var neutral_types = [cardTypes.Plus, cardTypes.Stop, cardTypes.SwitchColor,
                            cardTypes.SuperTaki, cardTypes.ChangeDirection, cardTypes.Take2,
                            cardTypes.Taki, cardTypes.KingCard];

        if (topCard.color !== card.color) return false;
        if (neutral_types.indexOf(topCard.type) !== -1) return true;
        return topCard.type === card.type;
    };

    this.makeMove = function(card) {
        stack.push(card);
        card_played = card;
    };

    this.endTaki = function() {
        taki_mode = false;
    }

    this.getNextTurn = function() {
        if (card_played.type === cardTypes.ChangeDirection) {
            direction *= -1;
        }
        
        if (card_played.type === cardTypes.Taki ||
            card_played.type === cardTypes.SuperTaki) {
            taki_mode = true;
        }
        else if (card_played.type !== cardTypes.Plus) {
            currentTurn += direction;
            if (card_played.type === cardTypes.Stop) currentTurn += direction;
            if (card_played.type === cardTypes.Take2) take2_counter += 2;
            currentTurn %= numPlayers;        
        }

        card_played = null;
        return currentTurn;
    };
};