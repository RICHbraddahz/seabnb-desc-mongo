const insertData = (collection, descriptions) => collection.insertMany(descriptions);

const getDescriptionById = (collection, id) => collection.findOne({ id: parseInt(id, 10) });

module.exports = {
  insertData,
  getDescriptionById,
  // getAllDescriptions,
};
