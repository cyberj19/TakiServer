import React from "react";
import {toTimeString} from '../modules/texts.mjs';

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { seconds: 0 };
    }

    componentDidUpdate(prevProps) {
        !prevProps.endTime && this.props.endTime && clearInterval(this.interval);
        if (prevProps.endTime && !this.props.endTime) {
            clearInterval(this.interval);
            this.interval = setInterval(() => this.tick(), 1000);
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    tick() {
        this.setState(prevState => ({
            seconds: prevState.seconds + 1
        }));
    }

    render() {
        const { startTime, endTime } = this.props;

        return endTime ?  toTimeString((endTime - startTime) / 1000)
                        : toTimeString((performance.now() - startTime) / 1000);
    }
}
export default Timer;