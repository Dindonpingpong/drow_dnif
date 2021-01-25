const { findWords } = require('./parser/parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const fs = require('fs');

const csvWriter = createCsvWriter({
    path: 'result.csv',
    header: [
        { id: 'inputWord', title: 'Origin' },
        { id: 'solution', title: 'Solution' },
        { id: 'firstWord', title: 'First' },
        { id: 'secondWord', title: 'Second' },
    ]
});

const main = async () => {
    try {
        let words = [];
        const data = fs.readFileSync('words.txt', 'UTF-8');
        const lines = data.split(/\r?\n/);

        lines.forEach((line) => words.push(line));

        const res = await findWords(words);
        const final = [].concat.apply([], res);

        await csvWriter.writeRecords(final)
            .then(() => {
                console.log('...Done');
            });

        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit();
    }
}

main();