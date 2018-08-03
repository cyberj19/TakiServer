import React from "react";
import {
    UNCOLORED_COLOR,
    CARDS,
    cardsColors
} from "../modules/cards.mjs";


class ComputerPlayer extends React.Component {
    constructor(props) {
        super(props);

        this.cardScore = this.cardScore.bind(this);
        this.playTurn = this.playTurn.bind(this);
    }

    componentWillMount() {
        window.setTimeout( this.playTurn, 1200 );
    }

    playTurn() {
        const {cards, chooseCard, isCardEligible, endTaki, turn, pullCard} = this.props;

        if (turn) {
            let maxScore = -1,
                colors = [],
                priorityIndex = -1,
                color = null;

            for (let i = 0; i < cards.length; ++i) {
                const currCard = cards[i],
                      currScore = this.cardScore(currCard);

                currCard.color !== UNCOLORED_COLOR && colors.push(currCard.color);
                if (!isCardEligible(currCard)) continue;

                if (currScore > maxScore) {
                    maxScore = currScore;
                    priorityIndex = i;
                }
            }

            if (maxScore === -1) {
                if (endTaki) {
                    endTaki();
                }
                else pullCard();
                return;
            }

            if (cards[priorityIndex].type === CARDS.COLOR) {
                color = (colors.length ? colors : cardsColors)[Math.floor(Math.random() * colors.length)];
            }

            chooseCard(priorityIndex, color);
        }
    }

    cardScore(card) { // this function runs for eligible cards only
        const {heapCard, cards, endTaki} = this.props,
            otherCardsInColor = cards.reduce((accumulator, card) => {
                if (card.color === heapCard.color) ++accumulator;
            }, 0);
        if (card.type === CARDS.COLOR) return endTaki && heapCard === CARDS.PLUS ? -2 : 0; // We want the computer to use "Change color" only if all other options been used
        if (card.type === CARDS.STOP) return endTaki ? 1.1 : 5;
        if (card.type === CARDS.TWO) return endTaki ? 1 : 3 ;
        if (card.type === CARDS.PLUS) return endTaki ? 0.5 : cards.length === 2 ? 7 : 4;  // if 2 cards remains i prefer to use the plus now and not in the last turn
        if (card.type === CARDS.TAKI) return endTaki ? -2 : (card.color === UNCOLORED_COLOR ? otherCardsInColor > 1 ? 8 : 0 : 6);
        return 2;
    }
    render() {
        return <span />;
    }
}

export default ComputerPlayer;