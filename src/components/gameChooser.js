import React from "react";

class GameChooser extends React.Component {
    constructor(props) {
        super(props);

        this.joinGame = this.joinGame.bind(this);

    }

    joinGame() {

    }


    render() {
        const {name, observers, players, required, state} = this.props;

        return (
            <div onClick={this.joinGame}
                 data-name={name}
                 data-observers={observers}
                 data-players={players}
                 data-required={required}
                 className={`game-chooser game-chooser--${state}`}>
                {name}
            </div>)
    }
}

export default GameChooser;
