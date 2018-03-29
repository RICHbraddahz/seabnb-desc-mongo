const dateMath = require('date-arithmetic');
const ProgressBar = require('ascii-progress');
const { range } = require('lodash');

const printStart = (url, dbName, startTime, seedCount) => {
  console.log('/* -----------------------');
  console.log('| Starting seed.');
  console.log(`| Inserting ${seedCount} items to ${url}/${dbName}`);
  console.log(`| Start time: ${startTime}`);
  console.log('+ ------------------------');
};

const printFinish = (url, dbName, startTime, seedCount) => {
  let endTime = new Date();
  console.log('+ -----------------------');
  console.log('| Completed seed.');
  console.log(`| Inserted ${seedCount} items to ${url}/${dbName}`);
  console.log(`| Start time: ${startTime}`);
  console.log(`| End time: ${endTime}`);
  console.log(`| Elapsed time: ${dateMath.diff(startTime, endTime, 'seconds', true)} seconds`);
  console.log('\\* ----------------\\rm/--');
};

const makeBars = (numCPUs, seedCount, printEvery) => range(numCPUs).map(id => new ProgressBar({
  schema: `| ${id} [:bar] :percent :inserted inserted (:ips inserts/sec)`,
  total: seedCount / printEvery
}));

module.exports = { printStart, printFinish, makeBars };
