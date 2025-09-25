// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory management view (Task 1)
router.get("/", utilities.handleErrors(invController.buildManagement))

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view (Week 3)
router.get('/detail/:invId', utilities.handleErrors(invController.buildDetailView));

// Deliver Add Classification view
router.get('/add-classification', utilities.handleErrors(invController.buildAddClassification))

// Process Add Classification
router.post(
  '/add-classification',
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

// Deliver Add Inventory view
router.get('/add-inventory', utilities.handleErrors(invController.buildAddInventory))

// Process Add Inventory
router.post(
  '/add-inventory',
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
)

module.exports = router;