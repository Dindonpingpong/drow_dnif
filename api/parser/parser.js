const fs = require('fs');
const { performance } = require('perf_hooks');
const _ = require('lodash');

const getWords = () => {
    const data = fs.readFileSync('./parser/russian_nouns.txt', 'UTF-8');
    return data.split(/\r?\n/);
}

const NOUNS = getWords();

const getAllSubsets =
    theArray => 
        theArray.reduce(
            (subsets, value) => subsets.concat(
                subsets.map(set => [value, ...set])
            ),
            [[]]
        ).filter(item => (item.length > 2 && item.length <= Math.floor(theArray.length / 2) + 2));

const isSuperset = (set, subset) => {
    for (let elem of subset) {
        if (!set.has(elem)) {
            return false;
        }
    }
    return true;
}

const parser = async (word) => {
    let allChars = word.split("");
    let result = [];
    let solutionCounter = 1;
    let maskMap = new Map();
    const consonantLetters = new Set(['б', 'в', 'г', 'д', 'ж', 'э', 'й', 'к', 'л', 'м', 'н', 'п',
        'р', 'с', 'т', 'ф', 'х', 'ц', 'ч', 'ш', 'щ']);
    const raw = await getAllSubsets(allChars);
    let n = 0;

    for (let i = 0; i < raw.length; i++) {
        let start = performance.now();
        
        const firstListChars = raw[i];
        const secondListChars = _.difference(allChars, firstListChars);
        
        const key = firstListChars.toString();
        if (maskMap.has(key))
        continue;
        
        maskMap.set(key, 1);
        
        let firstMask = new Set(firstListChars);
        let secondMask = new Set(secondListChars);
        
        if (isSuperset(consonantLetters, firstMask) || isSuperset(consonantLetters, secondMask)) {
            continue;
        }
        
        firstMask = `^[${[...firstMask].join('')}]{${firstListChars.length}}$`;
        secondMask = `^[${[...secondMask].join('')}]{${secondListChars.length}}$`;
        
        const res = await findWordsByMask(firstMask, secondMask, firstListChars.sort(), secondListChars.sort());
        if (res !== null) {
            let tmp = new Object();
            tmp['inputWord'] = word;
            tmp['solution'] = solutionCounter++;
            tmp['firstWord'] = res['firstWord'].words;
            tmp['secondWord'] = res['secondWord'].words;
            result.push(tmp);
        }
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        let end = performance.now();
        process.stdout.write(`\rVar ${word} ${firstListChars} | ${secondListChars} | ${n++} ${Math.round(used * 100) / 100} MB | ${end - start} ms`);
    }

    return result;
}

const filterResult = (mask, listOfChars) => {
    const re = new RegExp(mask);
    const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const filtered = NOUNS.filter((item) => {
        const sorted = item.split("").sort();

        if (re.test(item) && equals(sorted, listOfChars)) {
            return item;
        }
    });

    return (filtered.length > 0) ? filtered : null;
}

const pretty = (filtered) => {
    let result = new Object();
    result['words'] = filtered.join(', ');

    return result;
}

const findWordsByMask = async (firstMask, secondMask, firstListChars, secondListChars) => {
    try {
        const filteredFirst = await filterResult(firstMask, firstListChars);
        const filteredSecond = await filterResult(secondMask, secondListChars);

        if (filteredFirst === null || filteredSecond === null)
            return null;

        let final = new Object();
        final['firstWord'] = pretty(filteredFirst);
        final['secondWord'] = pretty(filteredSecond);

        return final;
    } catch (e) {
        console.log(e.message)
        return null;
    }
}

exports.findWords = async (listOfWords) => {
    try {
        const result = await Promise.all(listOfWords
            .filter((word) => (word.length > 6 && word.match(/[A-z0-9]/g) === null))
            .map((word) => parser(word.toLowerCase())));

        return result;
    } catch (e) {
        console.log(e.message);
        return null;
    }

}