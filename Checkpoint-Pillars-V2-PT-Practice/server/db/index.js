const db = require('./db');
const Place = require('./Place');
const seed = require('./seed');

// If we were to create any associations between different tables
// this would be a good place to do that:

module.exports = {
  db,
  seed,
  models: {
    Place
  },
};
