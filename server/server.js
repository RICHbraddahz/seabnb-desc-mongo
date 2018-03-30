const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

MongoClient.connect('mongodb://localhost/descriptions')
  .then((mongoClient) => {
    console.log('Connected to MongoDB');
    app.use(cors());

    const db = mongoClient.db('descriptions');
    const collection = db.collection('descriptions');

    app.get('/:id', async (req, res) => {
      const { id } = req.params;
      let itemData = await collection.findOne({ id });

      res.send(itemData);
    });

    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((e) => {
    console.log(`Error connecting to MongoDB:`, e);
  });
