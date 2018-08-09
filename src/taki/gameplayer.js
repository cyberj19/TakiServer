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
    me.hasEligibleCards = function(currentCard, take2mode) {
        return cards.some(c=>cardsModule.isEligible(c,currentCard,take2mode));
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

    me.getCard = function(card) {
        
        if(cards[card.index].type === cardTypes.Color){
           return {type:cardTypes.Color, color:card.color}
        }
        else{
            return cards[card.index];
        };
    };

    me.addCards = function(newCards) {
        newCards.forEach(c => cards.push(c));
    };

    me.removeCard = function(card) {
        cards.splice(card.index, 1);
    };
};