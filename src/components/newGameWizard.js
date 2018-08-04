import React from "react";
import Dialog from "./dialog";
import {apiCall} from "../helpers/http";
import {getText} from "../modules/texts.mjs";

class NewGameWizard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gameName: '',
            gamesErrors: null,
            playersAmount: 0,
        };

        this.inputChange = this.inputChange.bind(this);
        this.setNumber = this.setNumber.bind(this);
        this.playerChooseInput = this.playerChooseInput.bind(this);
        this.cancelFn = this.cancelFn.bind(this);
        this.closePlayersModal = this.closePlayersModal.bind(this);
    }

    setNumber(playersAmount) {
        this.setState({playersAmount})
    }
    inputChange(e) {
        this.setState({gameName: e.target.value.length ? e.target.value : ""});
    }

    cancelFn() {
        this.setState({
            gameName: '',
            gamesErrors: null,
            playersAmount: 0,
        });

        this.props.closeFn();
    }

    closePlayersModal() {
        const {gameName, playersAmount} = this.state,
            {player} = this.props;
        if (gameName.length && playersAmount) {

            apiCall(
                'newGame',
                {player, game: gameName, required_players: playersAmount},
                this.cancelFn,
                res => this.setState({gamesErrors: getText(res.body.error === 20 ? 'gameNameExist' : 'unknownError')})
                );
        }
    }

    playerChooseInput() {
        const _this = this;
        return [2, 3, 4].map(number => [<input type="radio" key={number} value={number} id={`dialog-player-num-${number}`} name="number"/>,
            <label key={number + 'l'} onClick={() => _this.setNumber(number)} htmlFor={`dialog-player-num-${number}`}>{number}</label>]);
    }

    render() {
        const {gamesErrors} = this.state,
            {isOpen} = this.props;

        return (
            <Dialog title={getText('newGameModalTitle')}
                    approveFunction={this.closePlayersModal}
                    description={isOpen && <div>
                        Game Name: <input onBlur={this.inputChange}/><br/>
                        Players to start game: {this.playerChooseInput()}<br/>
                        {gamesErrors && <div>{gamesErrors}</div>}
                    </div>}
                    cancelFn={this.cancelFn}
                    isOpen={isOpen}
            />)
    }
}

export default NewGameWizard;
