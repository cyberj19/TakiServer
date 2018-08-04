const consts = require('./consts.js');
const cardTypes = consts.cardTypes;
const cardsModule = require('./cards.js');

exports.GamePlayer = function(name,id,state) {
    let me = this;

    me.name = name;
    me.state = state;
    let cards = [];
    me.type = 'human';
    me.id = id;
    me.numTurns = 0;
    me.totalTime = 0;
    me.avgTimePerTurn = 0;

    let turnStartTime = 0;
    let win = -1;

    me.startTurn = function() {
        turnStartTime = Math.floor(Date.now()/1000);
    }

    me.endTurn = function() {
        me.numTurns++;
        let cts = Math.floor(Date.now()/1000);
        me.totalTime += cts-turnStartTime;
        me.avgTimePerTurn = me.totalTime*1.0/me.numTurns;
    }

    me.setWin = function(win) {
        me.win = win;
    }
    me.hasElligibleCards = function(currentCard) {
        return cards.some(c=>cardsModule.isElligible(c,currentCard));
    };

    const getView = function(currentPlayerId) {
        return {
            name: me.name,
            cards: cards,
            type: me.type,
            id: me.id,
            turn: me.id === currentPlayerId,
            win: win,
            numTurns: me.numTurns,
            avgTimePerTurn: me.avgTimePerTurn
        };        
    }
    
    me.getSelfView = function(currentPlayerId) {
        let view = getView(currentPlayerId);
        return view;
    };

    me.getOpponentView = function(currentPlayerId) {
        let view = getView(currentPlayerId);
        view.cards = cards.map(c=>{
            return {};
        });
        return view;
    };

    me.getSummaryView = function() {
        return {
            name: me.name,
            turnsWithOneCard: 1,
            numTurns: me.numTurns,
            avgTimePerTurn: me.avgTimePerTurn,
            win: win
        }
    };

    me.hasCards = function() {
        return cards.length > 0;
    };

    const getCardIndex = function(card) {
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].type === card.type) {
                if (card.type === cardTypes.Color || card.type === cardTypes.SuperTaki)
                    return i;
                if (card.color === cards[i].color) return i;
            }
        }
        return -1;
    };

    me.getCard = function(card) {
        console.log(card);
        var index = getCardIndex(card);
        if (index === -1) return undefined;
        return card;
    };

    me.addCards = function(newCards) {
        newCards.forEach(c => cards.push(c));
    };

    me.removeCard = function(card) {
        var index = getCardIndex(card);
        if (index !== -1) cards.splice(index, 1);
    };
};