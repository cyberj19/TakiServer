const consts = require('./consts.js');
const cardTypes = consts.cardTypes;
const cardColors = consts.cardColors;

exports.isEligible = function(newCard, currentCard, take2mode) {
    if (take2mode) return newCard.type === cardTypes.Take2;
    
    if (newCard.type === cardTypes.Color) 
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