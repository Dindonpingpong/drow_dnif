const _ = require('lodash');

const getAllSubsets =
    theArray => theArray.reduce(
        (subsets, value) => subsets.concat(
            subsets.map(set => [value, ...set])
        ),
        [[]]
    ).filter(item => item.length > 2);


const test = "магистерство".split("");
const all = getAllSubsets(test)
let t1 = _.uniq(all)
let st = new Set(all)


let set = new Set(all.map(JSON.stringify));
let arr2 = Array.from(set).map(JSON.parse);

console.log(arr2.length, all.length);
