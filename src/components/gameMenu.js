import React from "react";
import Timer from './timer';
import {getText} from "../modules/texts.mjs";
import Dialog from "./dialog";


class GameMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            areYouSureOpen: false,
            statsOpen: false,
            modalType: null,
        };

        this.openModal = this.openModal.bind(this);
        this.cancelModal = this.cancelModal.bind(this);
        this.getValidateDialog = this.getValidateDialog.bind(this);
        this.approveStatsModal = this.approveStatsModal.bind(this);
        this.approveValidateModal = this.approveValidateModal.bind(this);
    }

    openModal(type) {
        this.setState({
            areYouSureOpen: true,
            modalType: type
        });
    }
    cancelModal() {
        this.setState({
            areYouSureOpen: false,
            modalType: null
        });
    }
    approveValidateModal() {
        this.props.setEndTime();

        this.setState({
            areYouSureOpen: false,
            statsOpen: true
        });
    }
    approveStatsModal() {
        const {players, endGameFn} = this.props,
                {modalType} = this.state,
                stats = players.map(({numTurns}) => numTurns)
                    .reduce((pre, move) => pre = [...pre, ...move], [])
                    .sort((a ,b) => a.time > b.time ? 1 : -1);

        //endGameFn(stats, modalType === RESTART);

        this.setState({
            areYouSureOpen: false,
            statsOpen: false,
            modalType: null,
        });
    }

    getValidateDialog() {
        const {areYouSureOpen} = this.state;

        return <Dialog key="validateDialog" isOpen={areYouSureOpen} title={getText('areYouSureTitle')}
                       cancelFn={this.cancelModal}
                       description={getText('areYouSureDesc')}
                       approveFunction={this.approveValidateModal}/>
    }


    render() {
        const {players, startTime, gameNumber, endGameFn} = this.props,
            turns = players.reduce((acc, player)=> (acc += player.numTurns), 0);

        return [
            this.getValidateDialog(),
            <ul key="gameMenu" className="menu">
                {endGameFn && <li onClick={endGameFn} className="exit">
                    Exit game
                </li>}
                {/*<li onClick={() => this.openModal(RESTART)} className="restart">
                    Restart
                </li>*/}
                <li className="clock">
                    <Timer startTime={startTime}/>
                    <hr/>
                    {turns}
                </li>
                {gameNumber !== null && <li className="tournament">
                    #{gameNumber}
                </li>}
            </ul>
        ];
    }
}

export default GameMenu;