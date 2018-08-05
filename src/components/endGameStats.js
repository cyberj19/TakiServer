import React from "react";
import {
    ACTION_INIT_PACK,
    TOURNAMENS_GAME
} from '../helpers/constants';
import {getText, toTimeString} from "../modules/texts.mjs";


class EndGameStats extends React.Component {
    constructor(props) {
        super(props);

        this.getEndStats = this.getEndStats.bind(this);
    }

    getEndStats() {
        const {players, winner} = this.props;

        let __playersStats = {};
        players.forEach(({numTurns, name, avgTimePerTurn, turnsWithOneCard}) => {
            __playersStats[name] = {
                name,
                playerAverageTime: avgTimePerTurn,
                oneCardTotal: turnsWithOneCard,
                playerTotalMoves: numTurns,
                playerType: 'player'
            }
        });
        const playersStats = winner.map(key => ({...__playersStats[key]}));
        return [{
            playerType: 'stats',
            name: 'stats',
            oneCardTotal: getText('oneCardTotal'),
            playerAverageTime: getText('playerAverageTime'),
            playerTotalMoves: getText('playerTotalMoves')
        }, ...playersStats].map(({playerType, name, oneCardTotal, playerAverageTime, playerTotalMoves}, i) => (
            <ul data-place={i} key={i + name} className={`player-stats ${playerType}`}>
                <li>{name}</li>
                <li>{oneCardTotal}</li>
                <li>{typeof playerAverageTime === 'string' ? playerAverageTime : toTimeString(playerAverageTime)}</li>
                <li>{playerTotalMoves}</li>
            </ul>));
    }

    render() {
        const {players, children} = this.props,
            totalTurns = players.reduce((acc, {numTurns}) => (acc += numTurns), 0);

        return <div>
            <strong>This game played, during {totalTurns} moves</strong><br/>
            {this.getEndStats()}<br/>
            {children}
            {children && <br/>}

        </div>;
    }
}

export default EndGameStats;