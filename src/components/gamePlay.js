import React from "react";
import Deck from "./deck"
import {
    PLAYER_TYPE,
    OPP_TYPE,
    MOVE_TAKE,
    MOVE_TAKI,
    MOVE_CARD,
} from '../helpers/constants';
import {
    UNCOLORED_COLOR,
    CARDS,
} from "../modules/cards.mjs";
import GameMenu from './gameMenu';
import {getText} from "../modules/texts.mjs";
import Dialog from "./dialog";
import EndGameDialog from "./endGameDialog";
import Heap from "./heap";
import {apiCall} from "../helpers/http";
import Chat from "./chat";

class GamePlay extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cantPullModal: false,
            winner: null,
            startTime: performance.now()
        };

        this.endTaki = this.endTaki.bind(this);
        this.leaveGame = this.leaveGame.bind(this);
        this.getPlayer = this.getPlayer.bind(this);
        this.chooseCard = this.chooseCard.bind(this);
        this.cantPullCard = this.cantPullCard.bind(this);
        this.pullFromStack = this.pullFromStack.bind(this);
        this.isCardEligible = this.isCardEligible.bind(this);
        this.getDeckClasses = this.getDeckClasses.bind(this);
        this.closePullCardModal = this.closePullCardModal.bind(this);
        this.playerHasEligibleCard = this.playerHasEligibleCard.bind(this);
    }

    pullFromStack() {
        if (!this.playerHasEligibleCard(true)) {
            const {playerName, gameObj : {name}} = this.props;
            apiCall('move', {player: playerName, game: name, move: MOVE_TAKE}, ()=> {}, this.cantPullCard);
        }
        else {
            this.cantPullCard();
        }
    }

    getPlayer() {
        return this.props.gameObj.players.filter(p => p.name === this.props.playerName)[0] || {};
    }

    playerHasEligibleCard(considerSuperTaki) {
        const {cards} = this.getPlayer();

        return cards.reduce((accumulator, card) => {
            if (considerSuperTaki && card.type === CARDS.TAKI && card.color === UNCOLORED_COLOR) return accumulator;
            return accumulator || this.isCardEligible(card);
        }, false);
    }

    endTaki() {
        const {playerName, gameObj : {name}} = this.props;
        apiCall('move', {player: playerName, game: name, move: MOVE_TAKI});
    }
    leaveGame() {
        const {playerName, gameObj : {isPlayer, name, state}} = this.props;
        (state !== 'Active' || !isPlayer) && apiCall('leaveGame', {player: playerName, game: name});
    }

    chooseCard(cardIndex, color) {
        const {playerName, gameObj : {name}} = this.props,
            player = this.getPlayer(),
            tempCard = {...player.cards[cardIndex]};

        if (this.isCardEligible(tempCard)) {
            apiCall('move', {
                player: playerName,
                game: name,
                move: MOVE_CARD,
                card: color ? {index: cardIndex, color} : {index: cardIndex}
            });
            return true;
        }
        return false;
    }

    isCardEligible(card) {
        const {heap, activeTwo, isTaki} = this.props.gameObj,
            topCard = heap[heap.length - 1];

        return activeTwo ? card.type === CARDS.TWO :
            isTaki ? topCard.color === card.color :
                !(!!topCard.type
                    && card.type !== topCard.type
                    && card.color !== UNCOLORED_COLOR
                    && card.color !== topCard.color)
    }

    cantPullCard() {
        this.setState({cantPullModal: true});
    }

    closePullCardModal() {
        this.setState({cantPullModal: false});
    }


    getDeckClasses() {
        const {playerName, gameObj} = this.props,
            {players} = gameObj,
            playersLength = players.length,
            _classnames = playersLength === 4 ? ['deck--left', 'deck--top', 'deck--right'] : playersLength === 3 ? ['deck--left', 'deck--right'] : ['deck--top'],
            classnames = [];
        let index = 0;
        players.forEach((player, i) => {if (player.name === playerName) index = i;});
        for (let i = 1; i < playersLength; ++i) {
            classnames[(index + i) % playersLength] = _classnames[i - 1];
        }

        return classnames;
    }

    render() {
        const {gameType, gameObj, playerName} = this.props,
            {cantPullModal, startTime} = this.state,
            {players, heap, winner, winners, observers, messages, name : gameName, isPlayer,tourScores, activeTwo,
                isTaki, state} = gameObj,
            _winners = winner || winners || [];


        if (state !== 'Pending') {
            const deckClass = this.getDeckClasses();
            if ( _winners.length !== players.length) {
                const topCard = heap[heap.length - 1],
                    player = this.getPlayer(),
                    isFinish = _winners.indexOf(playerName) > -1,
                    deckProps = i => ({
                        gameType,
                        className: deckClass[i],
                        winner: _winners,
                        viewMode: !isPlayer,
                        chooseCard: this.chooseCard,
                        isCardEligible: this.isCardEligible,
                        heapCard: topCard,
                        pullCard: this.pullFromStack,
                        endTaki: player.turn && isTaki && this.endTaki
                    });

                return (<div className="board">
                    <GameMenu players={players} startTime={startTime}
                              endGameFn={(isFinish || !isPlayer) ? this.leaveGame : null} gameNumber={tourScores ? tourScores.length + 1 : null}/>
                    <Dialog approveFunction={this.closePullCardModal} title={getText('CantPullTitle')}
                            description={getText('CantPullDesc' + (!player.turn ? 'NotPlayer' : (isTaki ? 'Taki' : '')))}
                            isOpen={cantPullModal} noCancel/>
                    {observers.length ? <div className="watchers"><h3>Watchers ({observers.length}):</h3>{observers.map(({name}, i) => <div key={i}>{name}</div>)}</div> : null}
                    {players.map((player, i) => <Deck key={i} {...player} {...deckProps(i)}
                                                      type={player.name === playerName ? PLAYER_TYPE : OPP_TYPE}/>)}
                    <div onClick={(player.turn && !isTaki) ? this.pullFromStack : this.cantPullCard}
                         className="pack stack">
                        {!!activeTwo && <span className="two-badge">{activeTwo}</span>}
                        <div
                            className={`card active ${player.turn && (this.playerHasEligibleCard() ? '' : 'required')}`}/>
                    </div>
                    {isPlayer && <Chat messages={messages} playerName={playerName} game={gameName}/>}
                    <Heap heap={heap}/>
                </div>);
            }
            else return  <EndGameDialog players={players} winner={_winners} exitGame={this.leaveGame}/>;
        }
        return <div>Game is pending, <br/> <br/> Until it start you can <span onClick={this.leaveGame} className="leave-game-btn">Leave it</span></div>
    }
}
export default GamePlay;