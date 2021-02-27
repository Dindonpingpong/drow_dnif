const fs = require('fs');
const iconv = require('iconv-lite');
const { Worker } = require('worker_threads');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
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

const findWords = async (listOfWords) => {
    try {
        listOfWords.forEach(word => {
            if (word.length < 6 || word.match(/[A-z0-9]/g) !== null)
                return;

            console.log(`Thread-parser ${word} has been inited`);
            const workerScriptFilePath = require.resolve('./parser/worker.js');
            const worker = new Worker(workerScriptFilePath);

            worker.on('error', (error) => console.log(error));

            worker.on('exit', (code) => {
                if (code !== 0)
                    throw new Error(`Worker stopped with exit code ${code}`);
            });

            worker.on('message', (parsedWord) => {
                const final = [].concat.apply([], parsedWord);
                const recordLines = csvStringifier.stringifyRecords(final);
                fs.appendFileSync("./../result.csv", toWin(recordLines));
            });

            worker.postMessage(word.toLowerCase());
        });
    }
    catch (e) {
        console.log(e.message);
        return null;
    };
};

const main = async () => {
    try {
        const data = fs.readFileSync('./../words.txt', 'UTF-8');
        const words = data.split(/\r?\n/);
        const headerLine = csvStringifier.getHeaderString();

        await fs.writeFileSync("./../result.csv", toWin(headerLine));
        await findWords(words);
    } catch (err) {
        console.error(err);
        process.exit();
    }
}

(async () => {
    await main();
})();