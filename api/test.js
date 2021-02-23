
const getAllSubsets =
    theArray => theArray.reduce(
        (subsets, value) => subsets.concat(
            subsets.map(set => [value, ...set])
        ),
        [[]]
    ).filter(item => item.length > 2);


const test = "флорист".split("");
const all = getAllSubsets(test)

const fs = require('fs');

const getWords = () => {
    const data = fs.readFileSync('./parser/russian_nouns.txt', 'UTF-8');
    return data.split(/\r?\n/);
}

const NOUNS = getWords();

const re = new RegExp('^[флот]{4}$');

const filtered = NOUNS.filter((item) => {

    if (re.test(item)) {
        console.log(item);
        return item;
    }
});