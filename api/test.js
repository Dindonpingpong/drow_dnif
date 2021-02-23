
const getAllSubsets =
    theArray => theArray.reduce(
        (subsets, value) => subsets.concat(
            subsets.map(set => [value, ...set])
        ),
        [[]]
    ).filter(item => item.length > 2);

console.log(getAllSubsets("123456789".split("")));