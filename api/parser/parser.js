const client = require('../../api/db/psql');

const parser = async (word) => {
    let result = new Object();
    result['word'] = word;
    result['solutions'] = [];
    const allChars = word.split("");
    const len = allChars.length;

    for (let i = 3; i < Math.floor(len / 2) + 1; i++) {
        for (let j = 0; j + i < len; j++) {
            let tmp = allChars.slice();
            const firstListChars = tmp.splice(j, i).sort();
            const secondListChars = tmp.sort();
            let firstMask = new Set(firstListChars);
            let secondMask = new Set(secondListChars);
            firstMask = `^[${[...firstMask].join(',')}]{${i}}$`;
            secondMask = `^[${[...secondMask].join(',')}]{${len - i}}$`;

            const res = await findWordsByMask(firstMask, secondMask, firstListChars, secondListChars);

            if (res !== null) {
                result['solutions'].push(res);
            }
        }
    }

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

        const pretty = (filtered, listOfChars) => {
            let result = new Object();
            result['letters'] = `(${listOfChars.join(',')})`;
            result['words'] = filtered;

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
        final['firstWord'] = pretty(filteredFirst, firstListChars);
        final['secondWord'] = pretty(filteredSecond, secondListChars);

        return final;
    } catch (e) {
        console.log(e.message)
        return null;
    }
}

exports.findWords = async (listOfWords) => {
    try {
        const result = await Promise.all(
            listOfWords.map((word) => {
                return (word.length < 6) ? console.log("Can't make it") : parser(word);
            }))

        return result;
    } catch (e) {
        console.log(e.message);
        return null;
    }

}