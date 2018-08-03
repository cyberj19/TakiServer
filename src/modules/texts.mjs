
const texts = {
    gameChooserHeader: 'Choose game to begin:',
    oneCardTotal: 'Total times had 1 card',
    playerAverageTime: 'Average time per turn',
    playerTotalMoves: 'Total moves',
    tournamentChooser: 'Tournament Game',
    areYouSureTitle: 'Are you sure?',
    youLost: 'You lost the game',
    tourScore: 'Score:',
    tourScoreTotal: 'Total score',
    areYouSureDesc: 'After clicking "OK" you will lose the game',
    settingsModalTitle: 'You can edit your settings:',
    regularChooser: 'Regular Game',
    tournamentChooserInfo: 'Play tournament game - you will play 3 games in a row and the winner will be the one with the highest score.',
    regularChooserInfo: 'Play regular TAKI game',
    CantPullTitle: 'Can\'t pull card right now.',
    CantPullDesc: 'Can\'t pull card right now, you probably have card choices before you pull new card',
    CantPullDescTaki: 'Can\'t pull card during a TAKI move on.',
    CantPullDescNotPlayer: 'Can\'t pull card not in your turn.',
    totalMoves: 'Total moves:',
    avgMoves: 'Average move time:',
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