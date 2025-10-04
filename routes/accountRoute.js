// Needed Resources 
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Default account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

// Route to build the account update view
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount))

// Process the account update
router.post("/update", utilities.checkLogin, regValidate.accountUpdateRules(), regValidate.checkAccountUpdateData, utilities.handleErrors(accountController.updateAccount))

// Process the password change
router.post("/change-password", utilities.checkLogin, utilities.handleErrors(accountController.changePassword))

// Process logout
router.get("/logout", utilities.handleErrors(accountController.logoutAccount))

// Route to build the login view when clicking "My Account"
// Only the path after "/account" is specified here
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router
