const db = require('./db');
const Place = require('./Place');

const seed = async () => {
  await db.sync({ force: true });
  const places = await Promise.all([
    Place.create({ place_name: 'NY STATE' }),
    Place.create({ place_name: 'Manhattan', category: 'CITY' }),
    Place.create({ place_name: 'Brooklyn', category: 'CITY' }),
  ]);
  const [
    NYS,
    manhattan,
    brooklyn
  ] = users;

  return places.reduce((acc, place) => {
    acc[place.place_name] = place;
    return acc;
  }, {});
};

module.exports = seed;
