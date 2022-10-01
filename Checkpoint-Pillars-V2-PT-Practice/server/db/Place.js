const Sequelize = require("sequelize");
const db = require("./db");

const Place = db.define("place", {
  place_name: {
    type: Sequelize.STRING,
    unique: true,
    //allowNull is necessary even with notEmpty - notEmpty will not block null values.
    allowNull: false,
    validate: {
      // notEmpty will block both empty strings and strings of only spaces
      notEmpty: true,
    },
  },
  category: {
    //ENUM is a hard limiter allowing only the enumerated values to be entered
    type: Sequelize.ENUM("CITY", "STATE", "COUNTRY"),
    defaultValue: "STATE",
    allowNull: false,
  },
  //Virtual Fields
  isState: {
    type: Sequelize.VIRTUAL,
    get() {
      //keep in mind this is basic JS, so you can create any logic to evalute if the category is a 'STATE'.
      return this.category === "STATE";
    },
  },

  // place_name: "new york city" --> "NYC"
  // place_name: "new jersey city" --> "NJC"
  nickname: {
    type: Sequelize.VIRTUAL,
    get() {
      // ['new', 'york', 'city']
      const wordsArray = this.place_name.split(" ");

      const capitalFirstLetterArray = wordsArray.map((word) => {
        const firstLetter = word[0];
        const capitalFirstLetter = firstLetter.toUpperCase();
        return capitalFirstLetter;
      });

      // ['N', 'Y', 'C'] --> 'NYC'
      return capitalFirstLetterArray.join("");

      //Very cringey one-liner: this.place_name.split(' ').map((word) => word[0].toUpperCase()).join('')
    },
  },
});

//Class Methods
Place.findCitiesWithNoParent = async () => {
  //async await is required for the findAll method - Don't forget to return!
  return await Place.findAll({
    where: {
      category: "CITY",
      //parentId is set below as a foreignKey in the association between Place and Place.
      parentId: null,
    },
  });
};

Place.findStatesWithCities = async () => {
  return await Place.findAll({
    where: {
      category: "STATE",
    },
    //include will provide the associated information of the instances that meet the requirements of our Where statement.
    include: {
      model: Place,
      as: "children",
    },
  });
};

//associations can defined further with 'as', 'through', and 'foreignKey'.
Place.belongsTo(Place, { as: "parent" });
Place.hasMany(Place, { as: "children", foreignKey: "parentId" });

module.exports = Place;

/**
 * We've created the association for you!
 *
 * A place can be related to another place:
 *       NY State (parent)
 *         |
 *       /   \
 *     NYC   Albany
 * (child)  (child)
 *
 * You can find the parent of a place and the children of a place
 */
