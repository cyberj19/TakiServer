const consts = require('./consts.js');
const cardTypes = consts.cardTypes;
const cardColors = consts.cardColors;

exports.isElligible = function(newCard, currentCard) {
    if (newCard.type === cardTypes.Color || 
        (newCard.type === cardTypes.SuperTaki && newCard.color === cardColors.None)) 
        return true;

    console.log('Card is of concrete type');
    if (currentCard.color === newCard.color) return true;
    console.log('Colors dont match');
    if (currentCard.type === newCard.type) return true;
    console.log('Types dont match');
    return false;
};

exports.isTaki = function(card) {
    return card && (card.type === cardTypes.Taki);
}

exports.isTake2 = function(card){
    return card && (card.type === cardTypes.Take2);
}