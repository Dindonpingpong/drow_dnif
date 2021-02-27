const { parentPort, workerData } = require('worker_threads');

const array = workerData;
const res = [];
const now = Date.now();

for (const el of array) {
	res.push(el);
}

parentPort.postMessage(res);
process.exit();
