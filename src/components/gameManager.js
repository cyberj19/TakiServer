import React from "react";
import {getText, getCompName} from "../modules/texts.mjs";
import GamePlay from "./gamePlay";
import GameView from "./gameView";
import Dialog from "./dialog";
import {
    PLAYER_TYPE,
    COMPUTER_TYPE,
    REGULAR_GAME,
    TOURNAMENS_GAME
} from '../helpers/constants'

const gameTypes = [REGULAR_GAME, TOURNAMENS_GAME];

class GameManager extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentGameType: null,
            currentGameId: null,
            playerName: null,
            viewMode: null,
            gamesStats: [],
            settingsModal: false,
            computerName: getCompName()
        };

        this.setGame = this.setGame.bind(this);
        this.endGame = this.endGame.bind(this);
        this.getViewMode = this.getViewMode.bind(this);
        this.inputChange = this.inputChange.bind(this);
        this.closeViewMode = this.closeViewMode.bind(this);
        this.startViewMode = this.startViewMode.bind(this);
        this.renderGameChooser = this.renderGameChooser.bind(this);
        this.openSettingsModal = this.openSettingsModal.bind(this);
        this.closeSettingsModal = this.closeSettingsModal.bind(this);
    }

    getGames() {
        return gameTypes; // in the future should get game list from server
    }
    startViewMode(stats) {
        const {currentGameType, currentGameId, gamesStats} = this.state;

        this.setState({
            gamesStats: [...gamesStats, {stats: JSON.parse(JSON.stringify(stats)), gameType: currentGameType, gameId: currentGameId}],
            currentGameType: null,
            currentGameId: null,
            viewMode: currentGameId
        });
    }
    closeViewMode() {
        this.setState({
            viewMode: null
        });
    }
    endGame(stats, replay) {
        const {currentGameType, currentGameId, gamesStats} = this.state;

        this.setState({
            gamesStats: [...gamesStats, {stats: JSON.parse(JSON.stringify(stats)), gameType: currentGameType, gameId: currentGameId}],
            currentGameType: replay ? currentGameType : null,
            currentGameId: replay ? [currentGameId.split('-')[0], performance.now()].join('-') : null,
        });
    }

    setGame(gameType, id) {
        this.setState({
            currentGameType: gameType,
            currentGameId: id
        });
    }
    openSettingsModal() {
        this.setState({settingsModal: true});
    }
    closeSettingsModal() {
        this.setState({settingsModal: false});
    }
    inputChange(e) {
        this.setState({playerName: e.target.value.length ? e.target.value : null});
    }

    renderGameChooser(gameType, id) {
        return <div onClick={() => this.setGame(gameType, `${id || 0}-${performance.now()}`)}
                    data-info={getText(gameType + 'ChooserInfo')}
                    key={gameType + id}
                    className={`game-chooser game-chooser--${gameType}`}>
            {getText(gameType + 'Chooser')}
        </div>;
    }
    getViewMode(gameStatsId) {
        const {gamesStats, playerName, computerName} = this.state;
        return <GameView closeView={this.closeViewMode}
                         names={{[PLAYER_TYPE]: playerName,[COMPUTER_TYPE]: computerName}}
                         moves={gamesStats.filter(({gameId}) => gameId === gameStatsId)[0].stats}/>
    }

    render() {
        const {currentGameType, viewMode, currentGameId, playerName, settingsModal, computerName} = this.state;

        return (viewMode ? this.getViewMode(viewMode)
            : (currentGameType && currentGameId !== null) ?
            <GamePlay computerName={computerName} gameType={currentGameType} gameId={currentGameId} playerName={playerName} withComputer={true} endGameFn={this.endGame} viewMode={this.startViewMode}/>
            : <div>
                <ul className="menu">
                    <li onClick={this.openSettingsModal} className="settings">
                        Settings
                    </li>
                </ul>
                <Dialog title={getText('settingsModalTitle')}
                        approveFunction={this.closeSettingsModal}
                        description={<div>Name: <input onBlur={this.inputChange} /></div>}
                        isOpen={settingsModal}
                        noCancel
                />
                <h1>{getText('gameChooserHeader')}</h1>
                {this.getGames().map(this.renderGameChooser)}
            </div>)
    }
}

export default GameManager;
