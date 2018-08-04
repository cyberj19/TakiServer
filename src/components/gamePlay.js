import React from "react";
import Deck from "./deck"
import {
    PLAYER_TYPE,
    OPP_TYPE,
    ACTION_CHOOSE_CARD,
    ACTION_INIT_PACK,
    ACTION_PULL_CARD,
    TOURNAMENS_GAME,
} from '../helpers/constants';
import {
    cardsColors,
    regularCards,
    getCardScore,
    unColoredCards,
    UNCOLORED_COLOR,
    CARDS,
} from "../modules/cards.mjs";
import GameMenu from './gameMenu';
import {getText} from "../modules/texts.mjs";
import Dialog from "./dialog";
import EndGameDialog from "./endGameDialog";
import Heap from "./heap";

class GamePlay extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cantPullModal: false,
            winner: null,
            startTime: performance.now()
        };

        this.endTaki = this.endTaki.bind(this);
        this.getPlayer = this.getPlayer.bind(this);
        this.setHeap = this.setHeap.bind(this);
        this.setStack = this.setStack.bind(this);
        this.pullCard = this.pullCard.bind(this);
        this.nextTurn = this.nextTurn.bind(this);
        this.startGame = this.startGame.bind(this);
        this.setEndTime = this.setEndTime.bind(this);
        this.chooseCard = this.chooseCard.bind(this);
        this.cantPullCard = this.cantPullCard.bind(this);
        this.pullFromStack = this.pullFromStack.bind(this);
        this.getPlayerScore = this.getPlayerScore.bind(this);
        this.isCardEligible = this.isCardEligible.bind(this);
        this.calcEndGameScore = this.calcEndGameScore.bind(this);
        this.getWinnerRender = this.getWinnerRender.bind(this);
        this.closePullCardModal = this.closePullCardModal.bind(this);
        this.playerHasEligibleCard = this.playerHasEligibleCard.bind(this);
    }


    componentDidUpdate(preProps) {

    }

    pullFromStack() {
        /*if (!this.playerHasEligibleCard(true)) {
            this.setState({activeTurn: false});

            const {turn, players, lastAction} = this.state,
                takeCards = window.setInterval(() => {
                    const {twoInAction, heap} = this.state,
                        newCard = this.pullCard();
                    let tempTakenCardsArr = [...this.state.takenCardsArr],
                        newPlayers = [...players],
                        newCards = [...players[turn].cards, {...newCard}],
                        newMoves = [...players[turn].moves];

                    if (!twoInAction) {
                        this.nextTurn();

                        newMoves.push({
                            type: ACTION_PULL_CARD,
                            playerType: players[turn].type,
                            cards: players.map(player => ({playerType: player.type, cards: (player.type === players[turn].type ? newCards : player.cards).map(card => ({...card}))})),//,
                            time: lastAction,
                            heapCard: {...heap[heap.length - 1]},
                            duration: performance.now() - lastAction,
                        });
                        newPlayers[turn] = {...newPlayers[turn], cards: [...newCards, ...tempTakenCardsArr], moves: [...newMoves]};
                        window.clearInterval(takeCards);

                        this.setState({
                            players: [...newPlayers],
                            twoInAction: 0,
                            activeTurn: true,
                            lastAction: performance.now(),
                            activeAction: null,
                            takenCardsArr: []
                        });
                    }
                    else {
                        this.setState({
                            players: [...newPlayers],
                            twoInAction: twoInAction === 2 ? 0 : twoInAction - 1,
                            takenCardsArr: [...tempTakenCardsArr, {...newCard}]
                        });
                    }
                }, 60);
        }
        else {
            this.cantPullCard();
        }*/
    }

    getPlayer() {
        return this.props.gameObj.players.filter(p => p.name === this.props.playerName)[0];
    }

    playerHasEligibleCard(considerSuperTaki) {
        const {cards} = this.getPlayer();

        return cards.reduce((accumulator, card) => {
            if (considerSuperTaki && card.type === CARDS.TAKI && card.color === UNCOLORED_COLOR) return accumulator;
            return accumulator || this.isCardEligible(card);
        }, false);
    }

    endTaki() {
        /*this.setState({activeTurn: false});
        const {heap} = this.state,
            topCard = heap[heap.length - 1];

        this.nextTurn([CARDS.STOP, CARDS.PLUS].indexOf(topCard.type) > -1 ? 2 : 1);
        this.setState({
            activeAction: topCard.type === CARDS.TWO ? CARDS.TWO : null,
            twoInAction: topCard.type === CARDS.TWO ? 2 : 0,
            activeTurn: true
        });*/
    }



    setStack(forceInit) {
        // const {stack} = this.state;
        // let {heap} = this.state;
        //
        // if (!forceInit && !!stack.length) return; // if stack isn't empty no need to set it again
        //
        // if (!forceInit && !!heap.length) { // if there is a heap already it will take the heap (and leave there only the top card)
        //     this.setState({heap: [{...heap[heap.length - 1]}], stack: [...heap.slice(0, -1)]});
        // }
        // else { // there is a need to create a new stack from the constants
        //     let tmpStack = [];
        //     for (let i = 0; i < 2; ++i) {
        //         regularCards.forEach(type => {
        //             cardsColors.forEach(color => {
        //                 tmpStack.push({type, color});
        //             });
        //         });
        //         unColoredCards.forEach(type => { // all uncolored cards are at least twice
        //             tmpStack.push({type, color: UNCOLORED_COLOR});
        //         });
        //         tmpStack.push({type: CARDS.COLOR, color: UNCOLORED_COLOR}); // color card is 4 timer (2 more)
        //     }
        //     this.setState({stack: tmpStack});
        // }
    }

    chooseCard(cardIndex, color) {


        const {players, turn, heap, activeAction, twoInAction, lastAction, tourScores} = this.state,
            topCard = heap[heap.length - 1];
        let tempPlayers = [...players],
            tempHeap = [...heap],
            tempCard = {...players[turn].cards[cardIndex]},
            tempCards = [...players[turn].cards];

        if (this.isCardEligible(tempCard)) {
            tempHeap.push({...tempCard, ...{color: tempCard.color === UNCOLORED_COLOR ? (color || topCard.color) : tempCard.color}});
            tempCards.splice(cardIndex, 1);
            tempPlayers[turn].moves.push({
                type: ACTION_CHOOSE_CARD,
                cards: players.map(player => ({playerType: player.type, cards: (player.type === players[turn].type ? tempCards : player.cards).map(card => ({...card}))})),// [...tempCards],
                playerType: tempPlayers[turn].type,
                heapCard: {...tempHeap[tempHeap.length - 1]},
                time: lastAction,
                duration: performance.now() - lastAction,
                chosenCard: {...tempCard, ...{color: tempCard.color === UNCOLORED_COLOR ? (color || topCard.color) : tempCard.color}}
            });
            tempPlayers[turn].cards = tempCards;
            this.setState({players: [...tempPlayers], heap: tempHeap});

            if (tempCard.type === CARDS.TAKI ||
                tempCard.type === CARDS.PLUS ||
                activeAction === CARDS.TAKI) {
                tempCard.type === CARDS.TAKI && this.setState({activeAction: CARDS.TAKI});
            }
            else {
                tempCard.type === CARDS.TWO && this.setState({activeAction: CARDS.TWO, twoInAction: twoInAction + 2});
                this.nextTurn(tempCard.type === CARDS.STOP ? 2 : 1)
            }
            this.setState({
                ...(!tempCards.length && tempCard.type !== CARDS.PLUS ? {
                    winner: turn,
                    endTime: performance.now(),
                    activeTurn: false,
                    tourScores: isTournament ? [...tourScores, this.calcEndGameScore(turn)] : null
                } : {
                    activeTurn: true
                }),
                lastAction: performance.now()
            });
            return true;
        }
        return false;*/
    }

    calcEndGameScore(winner) {
        /*const {players} = this.state;
        return {player: winner, score: players.reduce((acc, {cards}) => acc += cards.reduce((pre, card) => pre += getCardScore(card), 0), 0)};
    */
    }

    setEndTime() {
        //this.setState({endTime: performance.now()});
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

    nextTurn(turns = 1) {
        /*const {turn, players, winner} = this.state,
            nextTurn = (turn + turns) % players.length;

        winner === null && this.setState({turn: nextTurn});*/
    }

    setHeap() {
        //this.setState({heap: [this.pullCard(HEAP_TYPE)]});
    }

    cantPullCard() {
        this.setState({cantPullModal: true});
    }

    closePullCardModal() {
        this.setState({cantPullModal: false});
    }

    pullCard(rquire) {
        // const {stack} = this.state;
        // let tempStack = [...stack],
        //     cardLoc = Math.floor(Math.random() * tempStack.length); // Every pull we shuffeling
        // while (rquire === HEAP_TYPE && tempStack[cardLoc].color === UNCOLORED_COLOR) {
        //     cardLoc = Math.floor(Math.random() * tempStack.length);
        // }
        // const newCard = {...tempStack[cardLoc]};
        // tempStack.splice(cardLoc, 1);
        // this.setState({stack: tempStack});
        // this.setStack();
        // return newCard;
    };

    startGame() {
        /*const {players, stack} = this.props.gameObj,
            playersCount = players; // init empty array for each player
        let tempStack = [...stack],
            newCards = players.map(() => []);

        for (let i = 0; i < 8 * playersCount; ++i) {
            let cardLoc = Math.floor(Math.random() * tempStack.length);
            newCards[i % playersCount].push(tempStack[cardLoc]);
            tempStack.splice(cardLoc, 1);
        }

        this.setState({
            stack: tempStack,
            players: players.map((player, i) => {
                return {
                    ...player, ...{
                        cards: [...newCards[i]],
                        moves: [{
                            type: ACTION_INIT_PACK,
                            cards: [...newCards[i]],
                            time: performance.now(),
                            playerType: player.type
                        }]
                    }
                }
            }),
            turn: 0,
            winner: null,
            startTime: performance.now(),
            lastAction: performance.now(),
            endTime: null,
            activeAction: null,
            twoInAction: 0,
            activeTurn: true,
        });*/
    }

    getWinnerRender() {
        const {gameType, endGameFn, gameObj} = this.props,
            {winners, players, heap, state} = gameObj;

        return state === 'Finish' && <EndGameDialog {...{gameType, endGameFn, winners, players,
                            heap,
                            initGame: ()=>{}
            }}/>
    }

    getPlayerScore(player) {
        //const {tourScores} = this.state;
        //return tourScores ? tourScores.reduce((acc, {player : scorePlayer, score}) => acc += scorePlayer === player ? score : 0, 0) : 0
    }

    render() {
        const {endGameFn, gameType, gameObj, playerName} = this.props,
            {cantPullModal, startTime} = this.state,
            {players, heap, winner, turn, tourScores, activeTwo,
                isTaki, state} = gameObj;

        if (state === 'Active') {
            const topCard = heap[heap.length - 1],
                player = this.getPlayer(),
                deckProps = i => ({
                    gameType,
                    score: this.getPlayerScore(i),
                    chooseCard: this.chooseCard,
                    gameEnd: winner !== null,
                    isCardEligible: this.isCardEligible,
                    heapCard: topCard,
                    pullCard: this.pullFromStack,
                    endTaki: i === turn && takiMode && this.endTaki
                });

            return (<div className="board">
                <GameMenu players={players} startTime={startTime} setEndTime={this.setEndTime}
                          endGameFn={endGameFn} gameNumber={tourScores ? tourScores.length + 1 : null}/>
                {this.getWinnerRender()}
                <Dialog approveFunction={this.closePullCardModal} title={getText('CantPullTitle')}
                        description={getText('CantPullDesc' + (!player.turn ? 'NotPlayer' : (isTaki ? 'Taki' : '')))}
                        isOpen={cantPullModal} noCancel/>
                {players.map((player, i) => <Deck key={i} {...player} {...deckProps(i)} type={player.name === playerName ? PLAYER_TYPE : OPP_TYPE}/>)}
                <div onClick={(player.turn && !isTaki) ? this.pullFromStack : this.cantPullCard} className="pack stack">
                    {!!activeTwo && <span className="two-badge">{activeTwo}</span>}
                    <div className={`card active ${player.turn && (this.playerHasEligibleCard() ? '' : 'required')}`}/>
                </div>
                <Heap heap={heap}/>
            </div>);
        }
        return <div>Loading...</div>
    }
}
export default GamePlay;