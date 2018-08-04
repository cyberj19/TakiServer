import React from "react";
import {getText, getCompName} from "../modules/texts.mjs";
import GamePlay from "./gamePlay";
import GameView from "./gameView";
import {apiCall} from "../helpers/http";
import Dialog from "./dialog";
import NewGameWizard from "./newGameWizard";
import GameChooser from "./gameChooser";
import {
    PLAYER_TYPE,
    COMPUTER_TYPE,
} from '../helpers/constants'

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
            players: [],
            availableGames: [],
            settingsModal: true,
            newGameModal: false,
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
        this.openNewGameModal = this.openNewGameModal.bind(this);
        this.closeNewGameModal = this.closeNewGameModal.bind(this);
        this.openSettingsModal = this.openSettingsModal.bind(this);
        this.closeSettingsModal = this.closeSettingsModal.bind(this);
    }

    componentDidUpdate(oldProps, oldState) {
        if (oldState.loggedIn && !this.state.loggedIn) {
            window.clearInterval(this.state.pullingInterval);
        }
        if (!oldState.loggedIn && this.state.loggedIn) {
            this.setState({pullingInterval: window.setInterval(this.getViews, 700)});
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
        const {players, games} = response.body;
        this.setState({players, availableGames: games});
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
    openNewGameModal() {
        this.setState({newGameModal: true});
    }
    closeNewGameModal() {
        this.setState({newGameModal: false});
    }

    closeSettingsModal() {
        apiCall('login',
            {player: this.state.playerName},
            () => {
                this.setState({settingsModal: false, loggedIn: true})
            },
            response => {
                console.log(response);
                if (response.body.error === "PLAYER_NAME_EXISTS") {
                    this.setState(() => ({playerErrorMessage: getText('playerNameExist')}));
                }
                else {
                    this.setState(() => ({playerErrorMessage: getText('unknownError')}));
                }
            }
        );

    }

    inputChange(e) {
        this.setState({playerName: e.target.value.length ? e.target.value : null});
    }


    getViewMode(gameStatsId) {
        const {gamesStats, playerName, computerName} = this.state;
        return <GameView closeView={this.closeViewMode}
                         names={{[PLAYER_TYPE]: playerName, [COMPUTER_TYPE]: computerName}}
                         moves={gamesStats.filter(({gameId}) => gameId === gameStatsId)[0].stats}/>
    }

    logoutView() {
        return <li onClick={() => apiCall('logout', {player: this.state.playerName}, () => this.setState({settingsModal: false, loggedIn: false}))} className="logout">
                Log out
            </li>;
    }

    render() {
        const {currentGameType, viewMode, availableGames, players,
            loggedIn, currentGameId, playerName, settingsModal, newGameModal,
            playerErrorMessage, computerName} = this.state;

        return (viewMode ? this.getViewMode(viewMode)
            : (currentGameType && currentGameId !== null) ?
                <GamePlay computerName={computerName} gameType={currentGameType} gameId={currentGameId}
                          playerName={playerName} withComputer={true} endGameFn={this.endGame}
                          viewMode={this.startViewMode}/>
                : <div>
                    <ul className="menu">

                        {loggedIn ? this.logoutView() :
                            <li onClick={this.openSettingsModal} className="settings">
                                Settings
                            </li>}
                        {loggedIn && <li onClick={this.openNewGameModal} className="newgame">
                            New game
                        </li>}
                    </ul>
                    {!!players.length && <div className="players-list">
                        <h2>{getText('connectedPlayers')}</h2>
                        {players.map(player => <div className={player.name === playerName ? 'me' : ''}><strong>{player.name}</strong> - {player.state}</div>)}
                    </div>}
                    <Dialog title={getText('settingsModalTitle')}
                            approveFunction={this.closeSettingsModal}
                            description={<div><br/>Name: <input
                                onBlur={this.inputChange}/>{playerErrorMessage && <div>{playerErrorMessage}</div>}
                            </div>}
                            isOpen={settingsModal || !loggedIn}
                            noCancel
                    />
                    <NewGameWizard isOpen={newGameModal} closeFn={this.closeNewGameModal} player={playerName}/>
                    <div className="games-list">

                        <h1>{getText('gameChooserHeader')}</h1>
                        {!!availableGames.length ? availableGames.map((props, id) => <GameChooser player={playerName} key={id} {...props}/>) : loggedIn ? 'Create new game' : getText('loginFirst')}
                    </div>
                </div>)
    }
}

export default GameManager;
