const { expect } = require("chai");
const {
  db,
  models: { Place },
} = require("../../server/db");

const _app = require("../../server/app");
const app = require("supertest")(_app);

describe("Tier 2: Eager Loading, One-To-Many Associations", () => {
  beforeEach(async () => {
    await db.sync({ force: true });
    const newYorkState = await Place.create({
      place_name: "new york state",
      category: "STATE",
    });
    await Promise.all([
      Place.create({
        place_name: "NYC",
        parentId: newYorkState.id,
        category: "CITY",
      }),
      Place.create({ place_name: "Seattle", category: "CITY" }),
      Place.create({ place_name: "Albany", category: "CITY" }),
      Place.create({ place_name: "USA", category: "COUNTRY" }),
      Place.create({ place_name: "NJ", category: "STATE" }),
      Place.create({
        place_name: "Mount Vernon",
        parentId: newYorkState.id,
        category: "CITY",
      }),
    ]);
  });

  describe("Sequelize", () => {
    describe("Class Method: findStatesWithCities", () => {
      it("Place.findStatesWithCities is a class method", () => {
        expect(Place.findStatesWithCities).to.be.a(
          "function",
          "findStatesWithCities isn't a class method!"
        );
      });

      it("Place.findStatesWithCities returns all states", async () => {
        const states = await Place.findStatesWithCities();
        expect(states).to.be.a("array", "Didn't return an array!");
        expect(states).to.have.lengthOf(2, "Wrong number of states!");
        const names = states.map((state) => state.place_name);
        expect(names).to.have.members(
          ["NJ", "new york state"],
          "Didn't return the correct places"
        );
      });

      it("Place.findStateWithCities returns all states and their cities", async () => {
        const states = await Place.findStatesWithCities();
        const nys = states.find(
          (state) => state.place_name === "new york state"
        );
        expect(nys).to.be.an("object", "Could not find new york state");
        expect(nys.children).to.be.an(
          "array",
          "Couldn't find children of new york state"
        );
        const names = nys.children.map((place) => place.place_name);
        expect(names).to.include.members(
          ["Mount Vernon", "NYC"],
          "New York State has 2 cities"
        );
      });
    });
  });

  describe("Express", () => {
    describe("GET /api/places/states", () => {
      it("responds with all states", async () => {
        const response = await app.get("/api/places/states");
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("array");
        expect(response.body.length).to.equal(2);
        const names = response.body.map((place) => place.place_name);
        expect(names).to.include("new york state");
        expect(names).to.include("NJ");
      });

      it("responds with all states and their children", async () => {
        const response = await app.get("/api/places/states");
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("array");
        expect(response.body.length).to.equal(2);
        let names = response.body.map((place) => place.place_name);
        expect(names).to.include("new york state");
        expect(names).to.include("NJ");
        const nys = response.body.find(
          (state) => state.place_name === "new york state"
        );
        expect(nys.children.length).to.equal(2);
        names = nys.children.map((place) => place.place_name);
        expect(names).to.include.members(
          ["Mount Vernon", "NYC"],
          "New York State has 2 cities"
        );
      });
    });
  });
});
