const fs = require('fs');
const { performance } = require('perf_hooks');

const getWords = () => {
    const data = fs.readFileSync('./parser/russian_nouns.txt', 'UTF-8');
    return data.split(/\r?\n/);
}

const NOUNS = getWords();

const swap = (ar, i, j) => { let a = ar[i]; ar[i] = ar[j]; ar[j] = a; }

const permNxt = (ar, lf) => {
    let rt = ar.length - 1,
        i = rt - 1;
    while (i >= lf && ar[i] >= ar[i + 1]) i--;
    if (i < lf)
        return false;

    let j = rt;
    while (ar[i] >= ar[j]) j--;
    swap(ar, i, j);

    lf = i + 1;
    while (lf < rt)
        swap(ar, lf++, rt--);
    return true;
}

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
    const len = allChars.length;

    let n = 0;

    do {
        for (let i = 3; i < Math.floor(len / 2) + 1; i++) {
            for (let j = 0; j + i < len + 1; j++) {
                let start = performance.now();
                let tmp = allChars.slice();
                const firstListChars = tmp.splice(j, i).sort();
                const secondListChars = tmp.sort();

                const key = firstListChars.toString();
                if (maskMap.has(key))
                    continue;

                maskMap.set(key, 1);

                let firstMask = new Set(firstListChars);
                let secondMask = new Set(secondListChars);

                if (isSuperset(consonantLetters, firstMask) || isSuperset(consonantLetters, secondMask)) {
                    continue;
                }

                firstMask = `^[${[...firstMask].join('')}]{${i}}$`;
                secondMask = `^[${[...secondMask].join('')}]{${len - i}}$`;

                const res = await findWordsByMask(firstMask, secondMask, firstListChars, secondListChars);

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
                process.stdout.write(`\r${firstListChars} | ${secondListChars} | ${n++} | ${end - start} ms`);
                process.stdout.write(`\r${allChars} ${n++}`);
            }
        }
    }
    while (permNxt(allChars, 0));

    return result;
}

const filterResult = (mask, listOfChars) => {
    const re = new RegExp(mask);
    const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const filtered = NOUNS.filter((item) => {
        const sorted = item.split("").sort();

        if (re.test(item) && equals(sorted, listOfChars))
            return item;
    });

    // let filtered = NOUNS.filter((item) => re.test(item));

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