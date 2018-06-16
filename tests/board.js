const DealerModule = require('../taki/dealer.js');

let deck = DealerModule.defaultDeck();
var detDealer = new DealerModule.Delear(deck, 'deterministic');

const BoardModule = require('../taki/board.js');
let board = new BoardModule.Board(2,detDealer);
board.initialize();
var player1_cards = board.dealCard(8);
var player2_cards = board.dealCard(8);

detDealer.logCards();
console.log(board.getView());
console.log(player1_cards);
console.log(player2_cards);

board.placeCard({type: '+', color: 'yellow'});
board.endTurn();
board.placeCard({type:'STOP', color: 'yellow'});
board.endTurn();
board.placeCard({type: 'CDIR', color: 'yellow'});
board.endTurn();
console.log(board.getView());