const { findWords } = require('./parser/parser');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier
const fs = require('fs');
const iconv = require('iconv-lite');

const toWin = text => iconv.encode(text, "win1251");

const csvStringifier = createCsvStringifier({
    path: 'result.csv',
    encoding: 'unicode',
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


        const headerLine = csvStringifier.getHeaderString();
        const recordLines = csvStringifier.stringifyRecords(final);

        fs.writeFileSync("result.csv", toWin(headerLine + recordLines));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit();
    }
}

main();