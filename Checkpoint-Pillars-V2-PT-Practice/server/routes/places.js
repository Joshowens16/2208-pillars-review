const router = require("express").Router();

const {
  models: { Place },
} = require("../db");

// Be sure to use the router method from express!

//localhost//:3000/api/places/unassigned
router.get("/unassigned", async (req, res, next) => {
  //setting the variable as the return of the class method we created earlier makes it nice and easy to send back in the route!
  const unassCities = await Place.findCitiesWithNoParent();

  res.send(unassCities);
});
//localhost//:3000/api/places/states
router.get("/states", async (req, res, next) => {
  const states = await Place.findStatesWithCities();
  res.send(states);
});

// /api/places/:id
router.delete("/:id", async (req, res, next) => {
  //findByPk will find the place to be deleted by its primary key.
  //req.params.id will give the id to be deleted -  be sure to force it into a number value.
  const placeToDelete = await Place.findByPk(req.params.id);
  //setting an if-else to evaluate if the place exists and send back 204 or 404.
  if (placeToDelete) {
    await placeToDelete.destroy();
    res.sendStatus(204);
  } else {
    res.sendStatus(404);
  }
});
//test
module.exports = router;
