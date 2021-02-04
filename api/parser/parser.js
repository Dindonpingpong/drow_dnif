const client = require('../../api/db/psql');

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


const parser = async (word) => {
    let allChars = word.split("");
    let result = [];
    let solutionCounter = 1;
    let maskMap = new Map();
    const len = allChars.length;

    do {
        for (let i = 2; i < Math.floor(len / 2) + 1; i++) {
            for (let j = 0; j + i < len + 1; j++) {
                let tmp = allChars.slice();
                const firstListChars = tmp.splice(j, i).sort();
                const secondListChars = tmp.sort();

                const key = firstListChars.toString();
                if (maskMap.has(key))
                    continue;

                maskMap.set(key, 1);

                let firstMask = new Set(firstListChars);
                let secondMask = new Set(secondListChars);

                firstMask = `^[${[...firstMask].join(',')}]{${i}}$`;
                secondMask = `^[${[...secondMask].join(',')}]{${len - i}}$`;

                const res = await findWordsByMask(firstMask, secondMask, firstListChars, secondListChars);

                if (res !== null) {
                    let tmp = new Object();
                    tmp['inputWord'] = word;
                    tmp['solution'] = solutionCounter++;
                    tmp['firstWord'] = res['firstWord'].words;
                    tmp['secondWord'] = res['secondWord'].words;
                    result.push(tmp);
                }
            }
        }
    }
    while (permNxt(allChars, 0));

    return result;
}


const findWordsByMask = async (firstMask, secondMask, firstListChars, secondListChars) => {
    try {
        const query = (mask) => {
            return client.query(`SELECT REGEXP_MATCHES(NOUN, $1) FROM Words`, [mask]);
        }

        const filterResult = (listOfRawWords, listOfChars) => {
            const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

            const filtered = listOfRawWords.rows.map((item) => item['regexp_matches'][0]).filter((item) => {
                const sorted = item.split("").sort();

                if (equals(sorted, listOfChars))
                    return item;
            });

            return (filtered.length > 0) ? filtered : null;
        }

        const pretty = (filtered) => {
            let result = new Object();
            result['words'] = filtered.join(', ');

            return result;
        }

        const firstMaskWords = await query(firstMask);
        const secondMaskWords = await query(secondMask);

        if (firstMaskWords.rowCount === 0 || secondMaskWords === 0)
            return null;

        const filteredFirst = filterResult(firstMaskWords, firstListChars);
        const filteredSecond = filterResult(secondMaskWords, secondListChars);

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