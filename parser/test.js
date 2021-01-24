const { Client } = require('pg');

const client = new Client({
    user: 'super',
    host: 'localhost',
    database: 'dnif',
    password: '1234',
    port: 5432,
})

const parser = async (word) => {
    const wordList = word.split("");
    const len = wordList.length;

    for (i = 3; i < Math.floor(len / 2) + 1; i++) {
        for (j = 0; j + i < len; j++) {
            let tmp = wordList.slice();
            const firstListChars = tmp.splice(j, i).sort();
            const secondListChars = tmp.sort();
            let firstMask = new Set(firstListChars);
            let secondMask = new Set(secondListChars);
            firstMask = `^[${[...firstMask].join(',')}]{${i}}$`;
            secondMask = `^[${[...secondMask].join(',')}]{${len - i}}$`;

            const result = await findWordsByMask(firstMask, secondMask, firstListChars, secondListChars);

            if (result !== null) {
                console.log(result);
            }
        }
    }

}

const main = async (listOfWords) => {
    await client.connect();

    listOfWords.map((word) => {
        if (word.length < 6)
            console.log("Can't make it")
        else
            parser(word);
    })
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
            result[`Combinations from (${listOfChars.join(",")}) letters`] = filtered;

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

        return [pretty(filteredFirst, firstListChars), pretty(filteredSecond, secondListChars)];
    } catch (e) {
        console.log(e.message);
        return null;
    }
}


main(['суррогат']);