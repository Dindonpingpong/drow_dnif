const { findWords } = require('./parser/parser');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier
const fs = require('fs');
const iconv = require('iconv-lite');
const { performance } = require('perf_hooks');
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
        let start = performance.now();
        const data = fs.readFileSync('./../words.txt', 'UTF-8');
        const words = data.split(/\r?\n/);

        const res = await findWords(words);
        const final = [].concat.apply([], res);

        const headerLine = csvStringifier.getHeaderString();
        const recordLines = csvStringifier.stringifyRecords(final);

        fs.writeFileSync("./../result.csv", toWin(headerLine + recordLines));
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

        let end = performance.now();
        console.log('It took ' + (end - start) + ' ms.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit();
    }
}

main();