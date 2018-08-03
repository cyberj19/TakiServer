// card helper file
// That file define the available cards for each group
// each group is in a function to avoid referred arrays

const CARDS = {
    STOP: "STOP",
    TAKI: "TAKI",
    PLUS: "+",
    TWO: "2",
    COLOR: "COLOR",
    CHANGE_DIR: "CDIR"
};

const regularCards =  [
    "1", CARDS.TWO,"3", "4", "5", "6", "7", "8", "9", CARDS.PLUS, CARDS.STOP, CARDS.TAKI
];

const unColoredCards = [
    CARDS.COLOR,
    CARDS.TAKI
];
const cardsColors = [
    "red", "blue", "green", "yellow"
];

const UNCOLORED_COLOR = "none";

const getCardScore = ({type}) => [CARDS.TAKI, CARDS.COLOR].indexOf(type) > -1 ? 15 :
    [CARDS.STOP, CARDS.TWO, CARDS.PLUS].indexOf(type) > -1 ? 10 : parseInt(type);


export { CARDS, regularCards, unColoredCards, cardsColors, UNCOLORED_COLOR, getCardScore };