import React, {Component} from "react";
import {apiCall} from "../helpers/http";

class Chat extends Component {
    constructor() {
        super();

        this.state = {
            msg: '',
            input: null
        };

        this.changeMsg = this.changeMsg.bind(this);
        this.submitMsg = this.submitMsg.bind(this);
    }

    changeMsg(e) {
        this.setState({
            msg: e.target.value,
            input: e.target
        });
    }
    submitMsg() {
        const {msg, input} = this.state,
            { playerName, game }= this.props;
        if (msg.length) {
            apiCall('msg', {
                game,
                text: msg,
                player: playerName
            });

            input.value = '';
            this.setState({
                msg: '',
                input: null
            });

        }
    }

    render() {
        const {messages} = this.props;
        return (<div className="chat">
            {messages.map(msg => msg)}
            <input onChange={this.changeMsg} type="text"/><span onClick={this.submitMsg} className="chat__submit">Send</span>
        </div>)
    }
}

export default Chat;