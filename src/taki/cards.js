const consts = require('./consts.js');
const cardTypes = consts.cardTypes;
const cardColors = consts.cardColors;

exports.isEligible = function(newCard, currentCard, take2mode, isTakeCard=false) {
    if (take2mode) return newCard.type === cardTypes.Take2;
    if (newCard.type === cardTypes.Color) 
        return true;
    if (newCard.wasSuperTaki && !isTakeCard) return true;
    if (currentCard.color === newCard.color) return true;
    if (currentCard.type === newCard.type) return true;
    return false;
};

exports.isTaki = function(card) {
    return card && (card.type === cardTypes.Taki);
}

exports.isTake2 = function(card){
    return card && (card.type === cardTypes.Take2);
}