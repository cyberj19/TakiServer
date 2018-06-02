exports.errors = {
    PLAYER_NAME_EXISTS: 10,
    PLAYER_UNKNOWN: 11,
    GAME_NAME_EXISTS: 20,
    GAME_INVALID_NUM_PLAYERS: 21,
    GAME_UNKNOWN_NAME: 22,
    GAME_ALREADY_STARTED: 23,
    GAME_UNKNOWN_MOVE: 24,
    CARD_ILLEGAL: 30
};

exports.cardTypes = {
    One: "1",
    Take2: "2",
    Three: "3",
    Four: "4",
    Five: "5",
    Six: "6",
    Seven: "7",
    Eight: "8",
    Nine: "9",
    Plus: "+",
    Stop: "STOP",
    Taki: "TAKI",
    Color: "COLOR",
    SuperTaki: "STAKI",
    ChangeDirection: "CDIR"
};


exports.cardColors = {
    Red: "red",
    Blue: "blue",
    Green: "green",
    Yellow: "yellow",
    None: "none"
};

exports.moveTypes = {
    Card: "CARD",
    Take: "TAKE",
    EndTaki: "ENDTAKI"
}


exports.gameStates = {
    PENDING: 0,
    ACTIVE: 1
};
