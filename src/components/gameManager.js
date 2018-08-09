import React from "react";
import {getText} from "../modules/texts.mjs";
import GamePlay from "./gamePlay";
import {apiCall} from "../helpers/http";
import Dialog from "./dialog";
import NewGameWizard from "./newGameWizard";
import GameChooser from "./gameChooser";
import {
    REGULAR_GAME,
} from '../helpers/constants'

class GameManager extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentGameType: null,
            currentGame: null,
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
        };

        this.setView = this.setView.bind(this);
        this.getViews = this.getViews.bind(this);
        this.logoutView = this.logoutView.bind(this);
        this.inputChange = this.inputChange.bind(this);
        this.closeViewMode = this.closeViewMode.bind(this);
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
        apiCall('view', {player: this.state.playerName}, this.setView);
    }



    closeViewMode() {
        this.setState({
            viewMode: null
        });
    }

    setView(response) {
        const {players, games, game} = response.body;
        this.setState({players, currentGame: game, availableGames: games});
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


    logoutView() {
        return <li onClick={() => apiCall('logout', {player: this.state.playerName}, () => this.setState({settingsModal: false, loggedIn: false}))} className="logout">
                Log out
            </li>;
    }

    render() {
        
        const {viewMode, availableGames,
            loggedIn, currentGame, playerName, settingsModal, newGameModal,
            playerErrorMessage} = this.state;
        const players = this.state.players;

        return (viewMode ? ""
            : (currentGame) ?
                <GamePlay gameType={REGULAR_GAME} gameObj={currentGame}
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
