import React from "react";
import {
    ACTION_INIT_PACK,
    TOURNAMENS_GAME
} from '../helpers/constants';
import {getText, toTimeString} from "../modules/texts.mjs";


class EndGameStats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            areYouSureOpen: false,
            statsOpen: false,
            modalType: null,
        };
        this.getEndStats = this.getEndStats.bind(this);
    }

    getEndStats() {
        const {getPlayerScore, players, gameType} = this.props,
            isTournament = gameType === TOURNAMENS_GAME,
            playersStats = players.map(({moves, type, name}, i) => ({
                name,
                oneCardTotal: moves.filter(({type : moveType, cards}) => moveType !== ACTION_INIT_PACK &&
                    cards.filter(stats => stats.playerType === type)[0].cards.length === 1).length,
                playerTotalMoves: moves.length - 1,
                playerAverageTime: moves.length ? ((moves.filter(({type : moveType}) => moveType !== ACTION_INIT_PACK)
                    .reduce(((acc, {duration})=> duration && (acc += duration)), 0)) / ((moves.length - 1) || 1)) / 1000 : 0,
                playerType: type,
                score: getPlayerScore && getPlayerScore(i)
            }));
        return [{
            playerType: 'stats',
            name: 'stats',
            oneCardTotal: getText('oneCardTotal'),
            playerAverageTime: getText('playerAverageTime'),
            playerTotalMoves: getText('playerTotalMoves'),
            score: getText('tourScoreTotal')
        }, ...playersStats].map(({playerType, name, oneCardTotal, playerAverageTime, playerTotalMoves, score}, i) => (<ul key={i + name} className={`player-stats ${playerType}`}>
            <li>{name}</li>
            <li>{oneCardTotal}</li>
            <li>{typeof playerAverageTime === 'string' ? playerAverageTime : toTimeString(playerAverageTime)}</li>
            <li>{playerTotalMoves}</li>
            {isTournament && <li>{score}</li>}
        </ul>));
    }

    render() {
        const {startTime, endTime, players, noCancel, gameType, children, tournamentEnd, okExit} = this.props,
            gameTime = (endTime - startTime) / 1000,
            isTournament = gameType === TOURNAMENS_GAME,
            totalTurns = players.reduce((acc, {moves}) => (acc += moves.length - 1), 0);

        return <div>
            <strong>This game played {parseInt(gameTime / 60)} minutes and {parseInt(gameTime % 60)} seconds, during {totalTurns} moves</strong><br/>
            {this.getEndStats()}<br/>
            {children}
            {children && <br/>}

            Click "OK" to {(okExit || tournamentEnd) ? 'go main menu' : (isTournament ?  'next game' : 'play again')} {noCancel || tournamentEnd ? '' : 'and "Cancel" to go to main menu'}
        </div>;
    }
}

export default EndGameStats;