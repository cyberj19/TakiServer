const random = require('../utils/random.js');
const consts = require('./consts.js');
const cardTypes = consts.cardTypes;
const cardColors = consts.cardColors;

exports.defaultDeck = function () {
    deck = [];
    for (let i = 0; i < 4; i++)
        deck.push({
            type: cardTypes.Color,
            color: cardColors.None
        });

    const coloredCardsTypes = [cardTypes.One, cardTypes.Take2, cardTypes.Three, cardTypes.Four, cardTypes.Five,
        cardTypes.Six, cardTypes.Seven, cardTypes.Eight, cardTypes.Nine,
        cardTypes.Taki, cardTypes.Stop, cardTypes.Plus,
        cardTypes.ChangeDirection
    ];

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

    deck.push({
        color: cardColors.None,
        type: cardTypes.SuperTaki
    });
    deck.push({
        color: cardColors.None,
        type: cardTypes.SuperTaki
    });

    return deck;
}

exports.Delear = function (initCards, type) {
    let cards = [];
    cards = initCards;

    this.isEmpty = function() {
        return cards.length === 0;
    };

    this.getCard = function () {
        if (type === 'deterministic') {
            return cards.pop();
        } else {
            return cards.splice(random.randomIndex(cards), 1)[0];
        }
    };

    this.getFirstCard = function () {
        let card = this.getCard();
        if (card.type === cardTypes.SuperTaki ||
            card.type === cardTypes.Color) {
            if (type === 'deterministic') card.color = 'yellow';
            else {
                let color = random.randomKey(cardColors);
                card.color = cardColors[color];
            }
        }
        return card;
    };

    this.returnCards = function(oldCards) {
        for (let i = oldCards.length-1; i >= 0; i--) {
            cards.unshift(oldCards[i]);
        }
    }

    this.logCards = function() {
        for (let card of cards) {
            console.log(card);
        }
    }
}