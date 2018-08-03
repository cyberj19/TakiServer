import React from "react";
import Dialog from "./dialog";
import EndGameStats from './endGameStats';

import {ACTION_INIT_PACK, PLAYER_TYPE, REGULAR_GAME} from "../helpers/constants";

class EndGameDialog extends React.Component {

    constructor(props) {
        super(props);

        this.getViewModeText = this.getViewModeText.bind(this);
        this.getTourModeText = this.getTourModeText.bind(this);
        this.getTournamentWinner = this.getTournamentWinner.bind(this);
    }

    getViewModeText(stats) {
        const {viewMode} = this.props;
        return (<span>
                    <br/>
                    if you want to watch this game step by step <br/>
                    <span className="dialog__buttons__button" onClick={() => viewMode(stats)}>click here</span><br/>
                </span>);
    }

    getTourModeText() {
        const {tourScores, players} = this.props,
            tournamentEnd = tourScores && tourScores.length === 3,
            lastScore = tourScores && tourScores[tourScores.length - 1];
        return (<span>
                    {players[lastScore.player].name} has earned {lastScore.score} points
                    {tournamentEnd && <h2>
                        {players[this.getTournamentWinner()].type === PLAYER_TYPE && <div className="pyro"/>}
                        {players[this.getTournamentWinner()].name} has won the tournament
                    </h2>}
                </span>);
    }
    getTournamentWinner() {
        const {players, getPlayerScore} = this.props,
            scores = players.map((player, i) => getPlayerScore(i));

        return scores.indexOf(Math.max(...scores));
    }

    render() {
        const {gameType, endGameFn, winner, players, startTime,
                endTime, heap, tourScores, getPlayerScore, initGame} = this.props,
            tournamentEnd = tourScores && tourScores.length === 3,
            isRegular = gameType === REGULAR_GAME,
            winnerObj = players[winner];

        if (winner !== null) {
            const stats = [{type: ACTION_INIT_PACK, heap: [{...heap[0]}]}, ...players.map(({moves}) => moves)
                .reduce((pre, move) => pre = [...pre, ...move]).sort((a, b) => a.time > b.time ? 1 : -1)];

            return [
                (winnerObj.type === PLAYER_TYPE ? <div key="pyro" className="pyro"/> : null),
                <Dialog key="winDialog" isOpen title={`${winnerObj.name} has Won the game`}
                        cancelFn={() => endGameFn(stats)}
                        noCancel={!isRegular &&  tourScores.length === 3}
                        description={<EndGameStats {...{
                            players,
                            startTime,
                            endTime,
                            gameType,
                            tournamentEnd,
                            getPlayerScore
                        }}>{isRegular ? this.getViewModeText(stats) : this.getTourModeText()}</EndGameStats>}
                        approveFunction={() => isRegular ? endGameFn(stats, true) : (tournamentEnd ? endGameFn(stats) : initGame())}/>
            ];
        }
        return null;
    }
}

export default EndGameDialog;