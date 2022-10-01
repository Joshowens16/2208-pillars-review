const { expect } = require("chai");
const {
  db,
  models: { Place },
} = require("../../server/db");

const _app = require("../../server/app");
const app = require("supertest")(_app);

describe("Tier 3: Virtual Fields, Route Parameters, DELETE Routes", () => {
  describe("Sequelize", () => {
    beforeEach(async () => {
      await db.sync({ force: true });
    });

    describe("Virtual Field: isState", () => {
      describe("isState", () => {
        it("isState is true if the place is a state", async () => {
          const idaho = await Place.create({
            place_name: "Idaho",
            category: "STATE",
          });
          expect(idaho.isState).to.equal(true);
        });

        it("isState is virtual (it doesn't appear as a column in the database)", async () => {
          const idaho = await Place.create({
            place_name: "Idaho",
            category: "STATE",
          });
          expect(idaho.dataValues.isState).to.equal(undefined);
        });
      });
    });

    describe("Virtual Field: nickname", () => {
      describe("nickname", () => {
        it("capitalizes first letter of each word", async () => {
          const nyc = await Place.create({
            place_name: "new york city",
            category: "CITY",
          });
          expect(nyc.nickname).to.equal("NYC");
        });

        it("nickname is virtual (it doesn't appear as a column in the database)", async () => {
          const nyc = await Place.create({
            place_name: "new york city",
            category: "CITY",
          });
          expect(nyc.dataValues.nickname).to.equal(undefined);
        });
      });
    });
  });

  describe("Express", () => {
    let nyc;
    beforeEach(async () => {
      await db.sync({ force: true });
      nyc = await Place.create({
        place_name: "new york city",
        category: "CITY",
      });
    });

    describe("DELETE /api/places/:id", () => {
      it("deletes an existing place by its id", async () => {
        const response = await app.delete(`/api/places/${nyc.id}`);
        expect(response.status).to.equal(204);
        nyc = await Place.findByPk(nyc.id);
        expect(
          nyc,
          "new york city should have been deleted, but was not"
        ).to.equal(null);
      });

      it("responds with 404 if the place does not exist", async () => {
        const response = await app.delete("/api/places/121");
        expect(response.status).to.equal(404);
      });
    });
  });
});
