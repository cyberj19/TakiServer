exports.GamePlayer = function(name,id) {
    this.name = name;
    var cards = [];
    this.type = 'human';
    this.id = id;

    this.getView = function() {
        return {
            name: this.name,
            cards: cards,
            type: this.type,
            id: this.id
        };
    };

    this.getCard = function(card) {
        return false;
    };

    this.addCard = function(card) {
        // TODO: implement
    };

    this.removeCard = function(card) {
        // TODO : implement
    };
};