
const texts = {
    gameChooserHeader: 'Choose game to begin:',
    oneCardTotal: 'Total times had 1 card',
    playerAverageTime: 'Average time per turn',
    playerTotalMoves: 'Total moves',
    tournamentChooser: 'Tournament Game',
    areYouSureTitle: 'Are you sure?',
    connectedPlayers: 'Connected players:',
    youLost: 'You lost the game',
    tourScore: 'Score:',
    tourScoreTotal: 'Total score',
    unknownError: "Unknown error try again later",
    areYouSureDesc: 'After clicking "OK" you will lose the game',
    settingsModalTitle: 'You can edit your settings:',
    newGameModalTitle: 'Create new game',
    regularChooser: 'Regular Game',
    tournamentChooserInfo: 'Play tournament game - you will play 3 games in a row and the winner will be the one with the highest score.',
    regularChooserInfo: 'Play regular TAKI game',
    CantPullTitle: 'Can\'t pull card right now.',
    CantPullDesc: 'Can\'t pull card right now, you probably have card choices before you pull new card',
    CantPullDescTaki: 'Can\'t pull card during a TAKI move on.',
    CantPullDescNotPlayer: 'Can\'t pull card not in your turn.',
    totalMoves: 'Total moves:',
    loginFirst: 'Please login to play',
    avgMoves: 'Average move time:',
    playerNameExist: "User name already exist, please try another one",
    gameNameExist: "Game name already exist, please try another one",
    colorDialogTitle: 'Please choose color:',
};

export const getText = textKey => {
    return texts[textKey] || textKey;
};
const getPartTime = time => (time < 10 ? '0' : '') + time.toString();

export const toTimeString = seconds => {
    const timeSecs = parseInt(seconds % 60),
          timeMins = parseInt(seconds / 60);

    return getPartTime(timeMins) + ':' + getPartTime(timeSecs);
};

const computerNames =  ['Danny', 'Yaacov', 'Tomer', 'Ofir', 'David', 'Yonni'];

export const getCompName = () => computerNames[Math.floor(Math.random() * computerNames.length)];