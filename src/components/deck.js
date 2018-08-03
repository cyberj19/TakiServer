import React from "react";
import {UNCOLORED_COLOR, cardsColors, CARDS} from "../modules/cards.mjs";
import {getText, toTimeString} from "../modules/texts.mjs";
import {TOURNAMENS_GAME , ACTION_INIT_PACK, PLAYER_TYPE} from '../helpers/constants';
import ComputerPlayer from "./computerPlayer";
import Dialog from "./dialog";

class Deck extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            colorModalOpen: false,
            chosenColor: UNCOLORED_COLOR,
            chosenCardIndex: null,
            cards: props.cards
        };

        this.setColor = this.setColor.bind(this);
        this.openColorModal = this.openColorModal.bind(this);
        this.closeColorModal = this.closeColorModal.bind(this);
        this.colorDialogContent = this.colorDialogContent.bind(this);
    }

    componentWillReceiveProps(newProps) {
        let {cards, viewMode} = this.props,
            newCards = [...newProps.cards];
        if (newCards.length !== cards.length && newCards.length !== this.state.cards.length) {
            const isCardAdded = newCards.length > cards.length;

            let i = 0;
            for (; i < cards.length; ++i) {
                if (!newCards[i] || !cards[i] || newCards[i].color !== cards[i].color || newCards[i].type !== cards[i].type)
                    break;
            }
            this.setState({cards: (isCardAdded ? newCards : cards).map((card, j) => ({...card, [isCardAdded ? 'isIn' : 'isOut']: viewMode || !isCardAdded ? j === i : j >= i }))});
        }
    }

    componentDidUpdate(oldProps) {
        const {cards} = this.props;
        if (oldProps.cards.length !== cards.length) {
            window.setTimeout(() => this.setState({cards}), 300);
        }
    }

    setColor(color) {
        this.setState({chosenColor: color});
    }
    openColorModal(cardIndex) {
        this.setState({
            colorModalOpen: true,
            chosenCardIndex: cardIndex
        });
    }
    closeColorModal() {
        this.setState({
            colorModalOpen: false,
            chosenColor: UNCOLORED_COLOR,
            chosenCardIndex: null
        });
    }
    colorDialogContent() {
        const _this = this;
        return cardsColors.map(color => [<input type="radio" key={color} value={color} id={`dialog-color-${color}`} name="color"/>,
            <label key={color + 'l'} onClick={() => _this.setColor(color)} htmlFor={`dialog-color-${color}`}>{color}</label>]);
    }

    render() {
        const {
                name, type, moves, turn, chooseCard, isCardEligible, gameType,
                heapCard, pullCard, activeTurn, endTaki, gameEnd, viewMode, score
            } = this.props,
            {colorModalOpen, chosenCardIndex, chosenColor, cards} = this.state,
            isTournament = gameType === TOURNAMENS_GAME,
            avgMoveTime = moves && moves.length ? ((moves.filter(({type}) => type !== ACTION_INIT_PACK)
                .reduce(((acc, {duration}) => duration && (acc += duration)), 0)) / ((moves.length - 1) || 1)) / 1000 : 0,
            isPlayer = type === PLAYER_TYPE;

        return (<div className={`deck ${type} ${turn ? 'active' : ''}`}>
            {colorModalOpen && <Dialog title={getText('colorDialogTitle')}
                                       cancelFn={this.closeColorModal}
                                       approveFunction={() => chosenColor !== UNCOLORED_COLOR && chooseCard(chosenCardIndex, chosenColor) && this.closeColorModal()}
                                       description={this.colorDialogContent()}
                                       isOpen={colorModalOpen}
                                />}
            {!isPlayer && turn && activeTurn && !gameEnd &&
            <ComputerPlayer {...{cards, chooseCard, heapCard, pullCard, isCardEligible, endTaki, turn}}/>}
            <div className="deck-stats">
                <h2>{name || type}</h2>
                {moves && <h3>{getText('totalMoves')} {moves.length - 1}</h3>}
                {avgMoveTime ? <h3>{getText('avgMoves')} {toTimeString(avgMoveTime)}</h3> : null}
                {isTournament && <h3>{getText('tourScore')} {score}</h3>}
            </div>
            {!!cards.length && cards.map(({type: cardType, color, isIn, isOut}, i) => {
                const cardEligible = turn && isCardEligible({type: cardType, color}),
                    cardClassAdd = isIn ? 'in' : isOut ? 'chosen' : '';
                return <div key={i}
                            className={`card ${cardClassAdd}`}
                            {...(isPlayer || viewMode || gameEnd) ? {
                                onClick: () => cardEligible && activeTurn && (cardType === CARDS.COLOR ? this.openColorModal(i) : chooseCard(i)),
                                'data-card-type': cardType,
                                'data-color': color,
                                className: `card ${cardClassAdd ? cardClassAdd : ( cardEligible || !activeTurn ) ? 'active' : 'off'}`
                            } : {}
                            }
                />
            })}
            {isPlayer && endTaki && <div onClick={endTaki} className="end-taki-btn"/>}
        </div>)
    }
}


export default Deck;