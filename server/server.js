const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 80;

MongoClient.connect('mongodb://localhost/descriptions')
  .then((mongoClient) => {
    app.use(cors());

    const db = mongoClient.db('descriptions');
    const collection = db.collection('descriptions');

    app.get('/:id', async (req, res) => {
      const { id } = req.params;
      let itemData = await getDescriptionById(collection, id);

      res.send(itemData);
    });

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
