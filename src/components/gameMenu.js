import React from "react";
import Timer from './timer';

class GameMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            areYouSureOpen: false,
            statsOpen: false,
            modalType: null,
        };

    }

    render() {
        const {players, startTime, gameNumber, endGameFn} = this.props,
            turns = players.reduce((acc, player)=> (acc += player.numTurns), 0);

        return (<ul className="menu">
                {endGameFn && <li onClick={endGameFn} className="exit">
                    Exit game
                </li>}
                <li className="clock">
                    <Timer startTime={startTime}/>
                    <hr/>
                    {turns}
                </li>
                {gameNumber !== null && <li className="tournament">
                    #{gameNumber}
                </li>}
            </ul>)

    }
}

export default GameMenu;