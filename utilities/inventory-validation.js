const utilities = require(".")
const { body, validationResult } = require("express-validator")

const invValidate = {}

/* **********************************
 *  Add Classification Validation Rules
 * ********************************* */
invValidate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty().withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/).withMessage("Classification must contain only letters and numbers (no spaces or special characters)."),
  ]
}

/* ******************************
 * Check classification data and return errors or continue
 * ***************************** */
invValidate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    })
  }
  next()
}

/* **********************************
 *  Add Inventory Validation Rules
 * ********************************* */
invValidate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty().withMessage("Please choose a classification.")
      .isInt().withMessage("Classification is invalid."),
    body("inv_make")
      .trim().notEmpty().withMessage("Please provide a make."),
    body("inv_model")
      .trim().notEmpty().withMessage("Please provide a model."),
    body("inv_year")
      .notEmpty().withMessage("Please provide a year.")
      .isInt({ min: 1900, max: 2100 }).withMessage("Year must be a valid year."),
    body("inv_description")
      .trim().notEmpty().withMessage("Please provide a description."),
    body("inv_image")
      .trim().notEmpty().withMessage("Please provide an image path."),
    body("inv_thumbnail")
      .trim().notEmpty().withMessage("Please provide a thumbnail path."),
    body("inv_price")
      .notEmpty().withMessage("Please provide a price.")
      .isFloat({ min: 0 }).withMessage("Price must be a positive number."),
    body("inv_miles")
      .notEmpty().withMessage("Please provide miles.")
      .isInt({ min: 0 }).withMessage("Miles must be a non-negative integer."),
    body("inv_color")
      .trim().notEmpty().withMessage("Please provide a color."),
  ]
}

/* ******************************
 * Check inventory data and return errors or continue
 * ***************************** */
invValidate.checkInvData = async (req, res, next) => {
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
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors,
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
  next()
}

/* ******************************
 * Check update inventory data and return errors or continue to edit view
 * ***************************** */
invValidate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
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
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    return res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      errors,
      classificationSelect,
      inv_id,
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
  next()
}

module.exports = invValidate
