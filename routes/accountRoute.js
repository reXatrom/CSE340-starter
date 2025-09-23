// Needed Resources 
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

// Route to build the login view when clicking "My Account"
// Only the path after "/account" is specified here
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to process registration form submission
router.post('/register', utilities.handleErrors(accountController.registerAccount))

module.exports = router
