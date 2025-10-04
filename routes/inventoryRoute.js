// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory management view (Task 1)
router.get("/", utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildManagement))

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to get inventory by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to build inventory detail view (Week 3)
router.get('/detail/:invId', utilities.handleErrors(invController.buildDetailView));

// Route to deliver edit inventory view
router.get('/edit/:inv_id', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildEditInventory));

// Route to deliver delete confirmation view
router.get('/delete/:inv_id', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteInventory));

// Process Update Inventory
router.post(
  '/update',
  utilities.checkJWTToken,
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Process Delete Inventory
router.post('/delete/:inv_id', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory))

module.exports = router;