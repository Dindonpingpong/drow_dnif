function permNxt(ar, lf) {
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

function swap(ar, i, j) { let a = ar[i]; ar[i] = ar[j]; ar[j] = a; }

let ar = [1, 2, 3, 4, 5, 6, 7];

let i = 2;
for (let j = 0; j + i < 7 + 1; j++) {
    let tmp = ar.slice();
    const firstListChars = tmp.splice(j, i).sort();
    const secondListChars = tmp.sort();
    console.log(firstListChars, secondListChars);
}