const consts = require('./consts.js');
const cardTypes = consts.cardTypes;
const cardsModule = require('./cards.js');

exports.GamePlayer = function(name,id,state) {
    this.name = name;
    this.state = state;
    var cards = [];
    this.type = 'human';
    this.id = id;
    this.numTurns = 0;
    this.totalTime = 0;

    this.hasElligibleCards = function(currentCard) {
        return cards.some(c=>cardsModule.isElligible(c,currentCard));
    }
    this.getView = function(currentPlayerId) {
        return {
            name: this.name,
            cards: cards,
            type: this.type,
            id: this.id,
            turn: this.id === currentPlayerId
        };
    };

    this.getSummaryView = function() {
        return {
            name: this.name,
            turns_with_one_card: 1,
            num_turns: this.numTurns,
            avg_time_per_turn: this.totalTime*1.0/this.numTurns
        }
    }

    this.hasCards = function() {
        return cards.length > 0;
    }
    var getCardIndex = function(card) {
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].type === card.type) {
                if (card.type === cardTypes.Color || card.type === cardTypes.SuperTaki)
                    return i;
                if (card.color === cards[i].color) return i;
            }
        }
        return -1;
    }
    this.getCard = function(card) {
        console.log(card);
        var index = getCardIndex(card);
        if (index === -1) return undefined;
        return card;
    };

    this.addCards = function(newCards) {
        newCards.forEach(c => cards.push(c));
    };

    this.removeCard = function(card) {
        var index = getCardIndex(card);
        if (index !== -1) cards.splice(index, 1);
    };
};