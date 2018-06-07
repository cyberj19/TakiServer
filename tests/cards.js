const cards = require('../taki/cards.js');

test_cases = [
    {
        id: 1,
        curr: {color: 'red', type: '1'},
        next: {color: 'yellow', type: '2'},
        expected: false
    },
    {
        id: 2,
        curr: {color: 'yellow', type: '1'},
        next: {color: 'yellow', type: '2'},
        expected: true

    },
    {
        id: 3,
        curr: {color: 'yellow', type: 'TAKI'},
        next: {color: 'yellow', type: 'STOP'},
        expected: true
    }
];

let num_succeeded = 0;
for (let i = 0; i < test_cases.length; i++) {
    test = test_cases[i];
    if (cards.isElligible(test.next,test.curr) !== test.expected)
        console.log('Test ' + test.id + ' failed');
    else {
        console.log('Test ' + test.id + ' succeeded');
        num_succeeded++;
    }
};

console.log(num_succeeded + ' out of ' + test_cases.length + ' succeeded');