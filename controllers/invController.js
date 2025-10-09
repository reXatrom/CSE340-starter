const invModel = require("../models/inventory-model")
const reviewsModel = require("../models/reviews-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build management view (Task 1)
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      errors: null,
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Deliver Add Classification view (Task 2)
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Process Add Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)
  if (result && result.rows) {
    req.flash("notice", `Successfully added classification: ${classification_name}`)
    const newNav = await utilities.getNav()
    return res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav: newNav,
    })
  } else {
    req.flash("notice", "Sorry, the classification could not be added.")
    return res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name,
    })
  }
}

/* ***************************
 *  Deliver Add Inventory view (Task 3)
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      classificationList,
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Process Add Inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  const result = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    parseInt(inv_year),
    inv_description,
    inv_image,
    inv_thumbnail,
    parseFloat(inv_price),
    parseInt(inv_miles),
    inv_color
  )

  if (result && result.rows) {
    req.flash("notice", `Successfully added: ${inv_year} ${inv_make} ${inv_model}`)
    const newNav = await utilities.getNav()
    return res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav: newNav,
    })
  } else {
    req.flash("notice", "Sorry, the inventory item could not be added.")
    const classificationList = await utilities.buildClassificationList(classification_id)
    return res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
  }
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()

  // Handle case where no vehicles exist in this classification
  if (!data || data.length === 0) {
    return res.render("./inventory/classification", {
      title: "No vehicles found",
      nav,
      grid: "<p class='notice'>No vehicles found in this category.</p>",
    })
  }

  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}



/* ***************************
 *  Get inventory by classification as JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Deliver Edit Inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  if (!itemData) {
    return res.status(404).render("./inventory/edit-inventory", {
      title: "Inventory Item Not Found",
      nav,
      errors: null,
      classificationSelect: await utilities.buildClassificationList(),
    });
  }
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    parseFloat(inv_price),
    parseInt(inv_year),
    parseInt(inv_miles),
    inv_color,
    parseInt(classification_id)
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.` )
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Deliver Delete Confirmation view
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  if (!itemData) {
    return res.status(404).render("./inventory/delete-confirm", {
      title: "Inventory Item Not Found",
      nav,
      errors: null,
    });
  }
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash("notice", "The inventory item was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
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

  // Get reviews data for this vehicle
  const reviews = await reviewsModel.getReviewsByVehicleId(invId);
  const averageRating = await reviewsModel.getAverageRating(invId);

  const html = utilities.buildDetailView(vehicle);
  const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;

  res.render("inventory/detail", {
    title,
    nav,
    html,
    reviews,
    averageRating,
    inv_id: invId,
    account_id: res.locals.accountData ? res.locals.accountData.account_id : null
  });
};

module.exports = invCont
