exports.errors = {
    PLAYER_NAME_EXISTS: 'PLAYER_NAME_EXISTS',
    PLAYER_ILLEGAL_NAME: 'PLAYER_ILLEGAL_NAME',
    PLAYER_UNKNOWN: 'PLAYER_UNKNOWN',
    GAME_NAME_EXISTS: 20,
    GAME_INVALID_NUM_PLAYERS: 21,
    GAME_UNKNOWN_NAME: 22,
    GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
    GAME_CANNOT_LEAVE_WHILE_PLAYING: 'GAME_CANNOT_LEAVE_WHILE_PLAYING',
    GAME_CANNOT_REMOVE_WHEN_NOT_PENDING: 'GAME_CANNOT_REMOVE_WHEN_NOT_PENDING',
    GAME_MUST_BE_REMOVED_ONLY_BY_CREATOR:'GAME_MUST_BE_REMOVED_ONLY_BY_CREATOR',
    GAME_UNKNOWN_MOVE: 'GAME_UNKNOWN_MOVE',
    GAME_PLAYER_ALREADY_IN_GAME: 'GAME_PLAYER_ALREADY_IN_GAME',
    MOVE_ILLEGAL: 'MOVE_ILLEGAL',
    MOVE_PLAYER_NOT_PLAYING: 31,
    MOVE_ELLIGIBLE_CARDS: 'MOVE_ELLIGIBLE_CARDS',
    MOVE_UNAVAILABLE: 'MOVE_UNAVAILABLE',
    MOVE_NOT_PLAYERS_TURN: 'MOVE_NOT_PLAYERS_TURN'

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
};


exports.gameStates = {
    Pending: "Pending",
    Active: "Active",
    Finishing: "Finishing"
};

exports.playerStates = {
    Pending: 0,
    Playing: 1,
    Finished: 2
};