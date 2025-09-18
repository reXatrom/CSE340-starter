const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}



/* ***************************
 *  Build vehicle detail view (Week 3)
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const invId = req.params.invId;
  const vehicle = await invModel.getVehicleById(invId);
  let nav = await utilities.getNav();
  if (!vehicle) {
    return res.status(404).render("./inventory/detail", {
      title: "Vehicle Not Found",
      nav,
      html: "<p>Vehicle not found.</p>"
    });
  }
  const html = utilities.buildDetailView(vehicle);
  const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;
  res.render("inventory/detail", {
    title,
    nav,
    html
  });
};


module.exports = invCont