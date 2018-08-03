import React from "react";
import Deck from "./deck";

const Dialog = ({title, description, approveFunction, cancelFn, noCancel, isOpen}) => {
    return (<div className={`dialog ${isOpen ? 'open' : ''}`}>
        <div className="dialog__body">
            <div className="dialog__title">{title}</div>
            <div className="dialog__description">{description}</div>
            <div className="dialog__buttons">
                <div className="dialog__buttons__button approve" onClick={approveFunction}>OK</div>
                {!noCancel && <div className="dialog__buttons__button cancel" onClick={cancelFn}>Cancel</div>}
            </div>
        </div>
    </div>)
};

export default Dialog;