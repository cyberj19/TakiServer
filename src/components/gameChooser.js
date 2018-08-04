import React from "react";
import {apiCall} from "../helpers/http";

class GameChooser extends React.Component {
    constructor(props) {
        super(props);

        this.joinGame = this.joinGame.bind(this);
        this.deleteGame = this.deleteGame.bind(this);
    }

    deleteGame() {
        const {name, player} = this.props;

        apiCall('deleteGame', {player:  player, game: name});
    }
    joinGame() {
        const {name, player} = this.props;

        apiCall('joinGame', {player:  player, game: name});
    }


    render() {
        const {name, observers, players, required, state, created_by, player} = this.props;

        return (
            <div 
                 className={`game-chooser game-chooser--${state}`}>
                {name}
                <div className="game-chooser__actions">
                    {player === created_by && <div onClick={this.deleteGame} className="game-chooser__actions__delete">X</div>}
                    {state === 'Pending' && <div onClick={this.joinGame} className="game-chooser__actions__play">Join game</div>}
                    {state === 'Active' && <div className="game-chooser__actions__watch">Watch game</div>}
                </div>
                <div className="game-chooser__details">
                    <span className="game-chooser__details__creator">{created_by}</span>
                    <span className="game-chooser__details__players">{players}/{required} </span>
                    <span className="game-chooser__details__observers">{observers} </span>
                </div>
            </div>)
    }
}

export default GameChooser;
