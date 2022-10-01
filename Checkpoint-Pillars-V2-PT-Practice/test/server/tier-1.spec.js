const { expect } = require("chai");
const {
  db,
  models: { Place },
} = require("../../server/db");

const _app = require("../../server/app");
const app = require("supertest")(_app);

describe("Tier 1: Basic Fields, Class Methods, GET Routes", () => {
  describe("Sequelize", () => {
    beforeEach(async () => {
      await db.sync({ force: true });
    });

    describe("Basic Fields: place_name and category", () => {
      describe("place_name", () => {
        it("place_name is a string", async () => {
          const nyc = await Place.create({ place_name: "NYC" });
          expect(nyc.place_name).to.equal(
            "NYC",
            "Was not able to create a place with place_name NYC"
          );
        });

        it("name must be unique", async () => {
          // We shouldn't be able to create two places with same place_name.
          await Place.create({ place_name: "NYC" });
          try {
            await Place.create({ place_name: "NYC" });
            throw "noooo";
          } catch (ex) {
            expect(ex.errors.length).to.equal(1);
            expect(ex.errors[0].path).to.equal("place_name");
          }
        });

        it("name cannot be null", async () => {
          // We shouldn't be able to create a place without a place_name
          try {
            await Place.create({});
            throw "noooo";
          } catch (ex) {
            expect(ex.errors.length).to.equal(1);
            expect(ex.errors[0].path).to.equal("place_name");
          }
        });

        it("place_name cannot be an empty string", async () => {
          // We also shouldn't be able to create a Place with an empty place_name.
          try {
            await Place.create({ place_name: "" });
            throw "noooo";
          } catch (ex) {
            expect(ex.errors.length).to.equal(1);
            expect(ex.errors[0].path).to.equal("place_name");
          }
        });
        it("place_name cannot be a made of just spaces", async () => {
          // We also shouldn't be able to create a Place with place_name made of spaces
          try {
            await Place.create({ place_name: "   " });
            throw "noooo";
          } catch (ex) {
            expect(ex.errors.length).to.equal(1);
            expect(ex.errors[0].path).to.equal("place_name");
          }
        });
      });

      describe("category", () => {
        it('category can be be a "CITY", "STATE", or "COUNTRY"', async () => {
          const nys = await Place.create({
            place_name: "New York State",
            category: "STATE",
          });
          const nyc = await Place.create({
            place_name: "NYC",
            category: "CITY",
          });
          expect(nys.category).to.equal("STATE");
          expect(nyc.category).to.equal("CITY");
        });

        it('category defaults to "STATE" if not provided', async () => {
          const nys = await Place.create({ place_name: "New York State" });
          expect(nys.category).to.equal("STATE");
        });

        it("category cannot be null", async () => {
          try {
            const nys = await Place.create({
              place_name: "New York State",
              category: null,
            });
            throw "noooo";
          } catch (ex) {
            expect(ex.errors.length).to.equal(1);
            expect(ex.errors[0].path).to.equal("category");
          }
        });

        it('category can ONLY be either "CITY", "STATE", "COUNTRY"', async () => {
          try {
            await Place.create({
              place_name: "playground",
              category: "PLAYGROUND", // Invalid category! This promise should reject.
            });
            throw "noooo";
          } catch (ex) {
            expect(ex).to.not.equal("noooo");
          }
        });
      });
    });

    describe("Class Method: findCities with no parent", () => {
      it("Place.findCitiesWithNoParent is a class method", () => {
        expect(Place.findCitiesWithNoParent).to.be.a(
          "function",
          "findCitiesWithNoParent isn't a class method"
        );
      });

      it("Place.findCitiesWithNoParent returns all cities with no parentId", async () => {
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
        ]);
        const unassignedCities = await Place.findCitiesWithNoParent();
        expect(unassignedCities).to.be.a(
          "array",
          "Place.findUnassignedCities should return (a Promise that resolves to) an array"
        );
        expect(unassignedCities).to.have.lengthOf(
          2,
          "There should be only two unassigned cities"
        );
        const names = unassignedCities.map((place) => place.place_name);
        expect(names).to.have.members(["Seattle", "Albany"]);
      });
    });
  });

  describe("Express", () => {
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
      ]);
    });

    describe("GET /api/places/unassigned", () => {
      it("responds with all unassigned cities", async () => {
        const response = await app.get("/api/places/unassigned");
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("array");
        const names = response.body.map((place) => place.place_name);
        expect(names.length).to.equal(2);
        expect(names).to.include("Seattle");
        expect(names).to.include("Albany");
      });
    });
  });
});
