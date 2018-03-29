/* eslint-disable no-await-in-loop */
const dateMath = require('date-arithmetic');
const casual = require('casual');
const Descriptions = require('./descriptionModel.mongo');

const capitalLetters = [...Array(26)].map((val, i) => String.fromCharCode(i + 65));
const boatName = () => capitalLetters[casual.integer(0, 26)] + casual.integer(1, 200);

const arrayOfStrings = (count) => {
  let strings = [];
  for (let i = 0; i < count; i += 1) {
    strings.push(casual.string);
  }
  return strings;
};

const makeOneDescription = id => ({
  id,
  user: {
    name: casual.first_name,
    thumbnail: 'https://robohash.org/quidemsiteveniet.jpg?size=50x50&set=set1', // todo: replace with image url
    link: '#'
  },
  shipDetails: {
    name: boatName(),
    dock: casual.street,
    capacity: casual.integer(20, 40),
    boatRules: arrayOfStrings(casual.integer(0, 5)),
    heads: casual.integer(1, 10),
    description: casual.string,
    bedrooms: {
      capacity: casual.integer(1, 5),
      sleepingArrangement: casual.array_of_digits(casual.integer(1, 5)),
    },
    amenities: {
      priority: {
        anchor: casual.boolean,
        engine: casual.boolean,
        lifeJacket: casual.boolean,
        twoWayRadio: casual.boolean,
        soundSystem: casual.boolean,
        tv: casual.boolean,
        kitchen: casual.boolean,
        ac: casual.boolean,
        heating: casual.boolean,
      },
      optional: {
        inflatables: casual.boolean,
        fishingGear: casual.boolean,
        scubaGear: casual.boolean,
        harpoons: casual.boolean,
        sharkCage: casual.boolean,
        medication: casual.boolean,
        wifi: casual.boolean,
        pool: casual.boolean,
      },
    }
  },
});

const seedDescriptionBatch = (client, collection, startingValue, count) => {
  let descriptions = [];
  for (let i = 0; i < count; i += 1) {
    descriptions.push(makeOneDescription(startingValue + i));
  }

  return Descriptions.insertData(collection, descriptions)
    .catch((e) => {
      console.error(e);
      client.close();
    });
};

const seedAllDescriptions = async (
  client, collection,
  startingValue, count, batchSize,
  printEvery, startTime, tick
) => {
  for (let j = 0; j < count / printEvery; j += 1) {
    for (let i = 0; i < printEvery / batchSize; i += 1) {
      await seedDescriptionBatch(
        client,
        collection,
        (startingValue + (i * batchSize) + ((j * printEvery))),
        batchSize
      );
    }
    let inserted = (j + 1) * printEvery;
    let timeDifference = dateMath.diff(startTime, new Date(), 'seconds', true);
    let insertsPerSec = Math.floor(inserted / timeDifference);
    tick(inserted, insertsPerSec, inserted >= count);
  }
};

module.exports = { seedAllDescriptions };
