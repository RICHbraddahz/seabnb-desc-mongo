const { MongoClient } = require('mongodb');
const cluster = require('cluster');
const cpus = require('os').cpus();
const { seedAllDescriptions } = require('./seedFunctions.mongo');
const { printStart, printFinish, makeBars } = require('./seedLogging');

// let numCPUs = (process.env.numCPUs) ? parseInt(process.env.numCPUs, 10) : cpus.length;
const startingValue = process.env.startingValue ? parseInt(process.env.startingValue, 10) : 0;
const seedCount = (process.env.seedCount ? parseInt(process.env.seedCount, 10) : 10000000);
const batchSize = process.env.batchSize ? parseInt(process.env.batchSize, 10) : 1000;
const printEvery = process.env.printEvery ? parseInt(process.env.printEvery, 10) : 10000;

const url = 'mongodb://localhost:27017';
const dbName = process.env.dbname || 'descriptions';

const workers = [];
let finishedProcesses = 0;

let seedDatabase = async () => {
  const client = await MongoClient.connect(`${url}/${dbName}`);
  const db = client.db(dbName);
  const collection = db.collection(dbName);

  let startTime = new Date();

  await seedAllDescriptions(
    client, collection,
    startingValue, seedCount, batchSize,
    printEvery, startTime
  );

  console.log('| Setting id as index...');
  await collection.createIndex({ id: 1 });
  printFinish(url, dbName, startTime, seedCount);
  client.close();
  process.exit();
};

seedDatabase()
  .catch((e) => {
    console.log(e);
  });
