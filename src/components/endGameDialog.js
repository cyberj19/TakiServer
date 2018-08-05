import React from "react";
import Dialog from "./dialog";
import EndGameStats from './endGameStats';

import {ACTION_INIT_PACK, PLAYER_TYPE, REGULAR_GAME} from "../helpers/constants";

class EndGameDialog extends React.Component {
    render() {
        const {exitGame, winner = [], players} = this.props;

        if (winner.length === players.length) {
            return [
                <div key="pyro" className="pyro"/> ,
                <Dialog key="winDialog" isOpen title={`Game finished`}
                        noCancel
                        description={<EndGameStats {...{
                            players,
                            winner,
                        }}>Click ok to go main menu</EndGameStats>}
                        approveFunction={exitGame}/>
            ];
        }
        return null;
    }
}

export default EndGameDialog;