import React from "react";

class Heap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cards: [...this.setCardsWithRotate(props.heap)]
        };
    }

    componentWillReceiveProps(newProps) {
        const {heap} = newProps,
            {cards} = this.state;

        heap.length !== cards.length && this.setState({
            cards: [...(heap.length > cards.length ? [...cards, {...heap[heap.length - 1], isIn: true}] : [...heap])]
        })
    }
    componentDidUpdate(oldProps) {
        const {heap} = oldProps,
              {cards} = this.state;

        heap.length !== cards.length && window.setTimeout(() => this.setState({
            cards: [...this.setCardsWithRotate(cards)]
        }), 10);
    }

    setCardsWithRotate(cards) {
        return cards.map((card, i) => card.rotate ? card : {...card, rotate: (Math.floor((Math.random() * 50 - 25) * (i / (i + 10)))), isIn: false})
    }

    render() {
        const {cards} = this.state;
        return <div className='pack heap'>
            {cards && cards.map(({type, color, rotate, isIn}, i ) => <div key={i + 'heapCard'}
                                                    className={`card ${isIn ? 'in' : ''}`}
                                                    style={{transform: `rotate(${rotate || 0}deg)`}}
                                                    data-card-type={type}
                                                    data-color={color}/>)}
        </div>
    }
}
export default Heap;