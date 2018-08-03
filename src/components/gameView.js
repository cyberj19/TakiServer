import React from "react";
import Deck from "./deck"
import {
    ACTION_CHOOSE_CARD,
    ACTION_INIT_PACK,
} from '../helpers/constants';

class GameView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            players: [],
            heapCard: {},
            turn: 0,
            moves: [],
        };

        this.preMove = this.preMove.bind(this);
        this.nextMove = this.nextMove.bind(this);
    }

    componentDidMount() {
        const {moves, names} = this.props,
            players = moves.filter(({type, heap}) => type === ACTION_INIT_PACK && !heap).map(({playerType, cards})=> ({cards, type: playerType, name: names[playerType]})),
            heapCard = {...moves[0].heap[0]},
            newMoves = moves.filter(({type}) => type !== ACTION_INIT_PACK );

        this.setState({
            heapCard,
            players: [...players],
            turn: 0,
            moves: [{type: ACTION_CHOOSE_CARD, heapCard: heapCard, cards: players.map(player => ({playerType: player.type, cards: [...player.cards]}))}, ...newMoves],
        });
    }

    componentDidUpdate(preProps, preState) {
        const {turn, moves, players, heapCard} = this.state;
        if (preState.turn !== turn) {
            const currMove = moves[turn],
                tempPlayer = [...players.map(player => ({...player, cards: currMove.playerType === player.type ? [...currMove.cards] : player.cards}))];
            this.setState({
                players: tempPlayer,
                heapCard: currMove.type === ACTION_CHOOSE_CARD ? {...currMove.chosenCard} : heapCard
            });
        }
    }

    nextMove() {
        this.setState(prevState => {return {turn: (prevState.turn + 1) >= prevState.moves.length ? prevState.moves.length - 1 : prevState.turn + 1}});
    }
    preMove() {
        this.setState(prevState => {return {turn: (prevState.turn - 1) < 0 ? 0 : (prevState.turn - 1)}});
    }

    render() {
        const {closeView} = this.props,
            {players ,turn, moves} = this.state,
            currTurn = moves[turn];

        if (players[0] && (players[0].cards.length || players[1].cards.length)) {
            const heapCard = moves ? {...moves[turn].heapCard} : {},
                deckProps = (pType) => ({
                    heapCard,
                    activeTurn: false,
                    turn: pType === currTurn.playerType,
                    isCardEligible: ()=>{},
                    cards: [...moves[turn].cards.filter(({playerType}) => playerType === pType)[0].cards],
                    pullCard: this.pullFromStack,
                });

            return (<div className="board">
                <ul className="menu">
                    <li onClick={closeView} className="exit">
                        Exit view
                    </li>
                    <li>
                        played: <br/>
                        {turn}<br/>
                        turns
                    </li>
                    <li onClick={this.preMove} className={`pre ${turn === 0 ? 'disabled' : ''}`}>
                        Previous
                    </li>
                    <li onClick={this.nextMove} className={`next ${turn === moves.length - 1 ? 'disabled' : ''}`}>
                        Next
                    </li>
                </ul>
                {players.map((player, i) => <Deck key={i} {...player} {...deckProps(player.type)} viewMode/>)}
                <div className="pack stack">
                    <div className="card"/>
                </div>
                <div className="pack heap">
                    {heapCard && <div className="card" data-card-type={heapCard.type} data-color={heapCard.color}/>}
                </div>
            </div>);
        }
        return <div>Loading...</div>
    }
}

export default GameView;
