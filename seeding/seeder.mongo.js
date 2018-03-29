const { MongoClient } = require('mongodb');
const cluster = require('cluster');
const cpus = require('os').cpus();
const { seedAllDescriptions } = require('./seedFunctions.mongo');
const { printStart, printFinish, makeBars } = require('./seedLogging');

// let numCPUs = (process.env.numCPUs) ? parseInt(process.env.numCPUs, 10) : cpus.length;
const numCPUs = 1;
const startingValue = process.env.startingValue ? parseInt(process.env.startingValue, 10) : 0;
const seedCount = (process.env.seedCount ? parseInt(process.env.seedCount, 10) : 10000000) / numCPUs;
const batchSize = process.env.batchSize ? parseInt(process.env.batchSize, 10) : 1000;
const printEvery = process.env.printEvery ? parseInt(process.env.printEvery, 10) : 10000;

const url = 'mongodb://localhost:27017';
const dbName = process.env.dbname || 'descriptions';

const workers = [];
let finishedProcesses = 0;

if (cluster.isMaster) {
  for (let i = 0; i < (numCPUs - 1); i += 1) {
    workers.push(cluster.fork({
      startingValue: Math.round((i + 1) * (10000000 / numCPUs)),
      barId: i + 1
    }));
  }
}

let seedDatabase = async () => {
  const client = await MongoClient.connect(`${url}/${dbName}`);
  const db = client.db(dbName);
  const collection = db.collection(dbName);

  let startTime = new Date();
  let bars = [];

  let handleFinish = async () => {
    finishedProcesses += 1;
    if (finishedProcesses === numCPUs) {
      console.log('| Setting id as index...');
      await collection.createIndex({ id: 1 });
      printFinish(url, dbName, startTime, seedCount);
      client.close();
      process.exit();
    }
  };

  if (cluster.isMaster) {
    printStart(url, dbName, startTime, seedCount * numCPUs);
    bars = makeBars(numCPUs, seedCount, printEvery);

    workers.forEach((worker) => {
      worker.on('message', (msg) => {
        let [barId, inserted, ips, finished] = msg.split(',');
        bars[barId].tick({ inserted, ips });

        if (JSON.parse(finished)) {
          handleFinish();
        }
      });
    });
  }

  const tick = (cluster.isMaster) ? (inserted, ips) => {
    //bars[0].tick({ inserted, ips });
    console.log(`Inserted ${inserted} items (${ips} inserts/sec)`);
  } : (inserted, ips, finished) => {
    process.send(`${process.env.barId},${inserted},${ips},${finished}`);
  };

  await seedAllDescriptions(
    client, collection,
    startingValue, seedCount, batchSize,
    printEvery, startTime, tick
  );
  if (cluster.isMaster) {
    handleFinish();
  }
};

seedDatabase()
  .catch((e) => {
    console.log(e);
  });
