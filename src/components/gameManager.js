import React from "react";
import {getText, getCompName} from "../modules/texts.mjs";
import GamePlay from "./gamePlay";
import GameView from "./gameView";
import {apiCall} from "../helpers/http";
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
            loggedIn: false,
            viewMode: null,
            playerErrorMessage: null,
            gamesStats: [],
            availableGames: [],
            settingsModal: true,
            pullingInterval: null,
            computerName: getCompName()
        };

        this.setGame = this.setGame.bind(this);
        this.setView = this.setView.bind(this);
        this.getViews = this.getViews.bind(this);
        this.endGame = this.endGame.bind(this);
        this.logoutView = this.logoutView.bind(this);
        this.getViewMode = this.getViewMode.bind(this);
        this.inputChange = this.inputChange.bind(this);
        this.closeViewMode = this.closeViewMode.bind(this);
        this.startViewMode = this.startViewMode.bind(this);
        this.renderGameChooser = this.renderGameChooser.bind(this);
        this.openSettingsModal = this.openSettingsModal.bind(this);
        this.closeSettingsModal = this.closeSettingsModal.bind(this);
    }

    componentDidUpdate(oldProps, oldState) {
        if (oldState.loggedIn && !this.state.loggedIn) {
            window.clearInterval(this.state.pullingInterval);
        }
        if (!oldState.loggedIn && this.state.loggedIn) {
            this.setState({pullingInterval: window.setInterval(this.getViews, 125)});
        }

    }

    getViews() {
        apiCall('view', {}, this.setView);
    }

    startViewMode(stats) {
        const {currentGameType, currentGameId, gamesStats} = this.state;

        this.setState({
            gamesStats: [...gamesStats, {
                stats: JSON.parse(JSON.stringify(stats)),
                gameType: currentGameType,
                gameId: currentGameId
            }],
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

    setView(response) {
        console.log(response);
    }

    endGame(stats, replay) {
        const {currentGameType, currentGameId, gamesStats} = this.state;

        this.setState({
            gamesStats: [...gamesStats, {
                stats: JSON.parse(JSON.stringify(stats)),
                gameType: currentGameType,
                gameId: currentGameId
            }],
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
        apiCall('login',
            {name: this.state.playerName},
            () => {
                this.setState({settingsModal: false, loggedIn: true})
            },
            response => {
                console.log(response);
                if (response.status === 400) {
                    this.setState(() => ({playerErrorMessage: "User name already exist, please try another one"}));
                }
                else {
                    this.setState(() => ({playerErrorMessage: "Unkown error try again later"}));
                }
            }
        );

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
                         names={{[PLAYER_TYPE]: playerName, [COMPUTER_TYPE]: computerName}}
                         moves={gamesStats.filter(({gameId}) => gameId === gameStatsId)[0].stats}/>
    }

    logoutView() {
        return <div onClick={
            () => apiCall('logout', {}, () => this.setState({settingsModal: false, loggedIn: false}))
        } className="button">LOGOUT</div>
    }

    render() {
        const {currentGameType, viewMode, availableGames, loggedIn, currentGameId, playerName, settingsModal, playerErrorMessage, computerName} = this.state;

        return (viewMode ? this.getViewMode(viewMode)
            : (currentGameType && currentGameId !== null) ?
                <GamePlay computerName={computerName} gameType={currentGameType} gameId={currentGameId}
                          playerName={playerName} withComputer={true} endGameFn={this.endGame}
                          viewMode={this.startViewMode}/>
                : <div>
                    <ul className="menu">
                        <li onClick={this.openSettingsModal} className="settings">
                            Settings
                        </li>
                    </ul>
                    <Dialog title={getText('settingsModalTitle')}
                            approveFunction={this.closeSettingsModal}
                            description={<div>{loggedIn && this.logoutView()}<br/>Name: <input
                                onBlur={this.inputChange}/>{playerErrorMessage && <div>{playerErrorMessage}</div>}
                            </div>}
                            isOpen={settingsModal || !loggedIn}
                            noCancel
                    />
                    <h1>{getText('gameChooserHeader')}</h1>
                    {availableGames.map(this.renderGameChooser)}
                </div>)
    }
}

export default GameManager;
