const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const accountController = {}

/* ****************************************
*  Process Login
* *************************************** */
accountController.accountLogin = async function (req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  try {
    // 1) Lookup account by email
    const account = await accountModel.getAccountByEmail(account_email)
    if (!account) {
      req.flash("notice", "Invalid credentials.")
      return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email })
    }

    // 2) Compare password
    const valid = await bcrypt.compare(account_password, account.account_password)
    if (!valid) {
      req.flash("notice", "Invalid credentials.")
      return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email })
    }

    // 3) Sign JWT and set cookie
    const payload = {
      account_id: account.account_id,
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email,
      account_type: account.account_type,
    }
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" })

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    })

    // 4) Redirect to account management
    return res.redirect("/account/")
  } catch (err) {
    req.flash("notice", "Login failed. Please try again.")
    return res.status(500).render("account/login", { title: "Login", nav, errors: null, account_email })
  }
}

// Build the account management view
accountController.buildManagement = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("account/management", { title: "Account Management", nav, errors: null })
}

// Build the account update view
accountController.buildUpdateAccount = async function (req, res) {
  const nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)

  // Verify the account_id matches the logged-in user
  if (account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You can only update your own account.")
    return res.redirect("/account/")
  }

  // Get account data for the form
  const accountData = await accountModel.getAccountById(account_id)
  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/")
  }

  res.render("account/update-account", {
    title: "Update Account Information",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email
  })
}

// Process account update
accountController.updateAccount = async function (req, res) {
  const nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  // Verify the account_id matches the logged-in user
  if (parseInt(account_id) !== res.locals.accountData.account_id) {
    req.flash("notice", "You can only update your own account.")
    return res.redirect("/account/")
  }

  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)

  if (updateResult) {
    req.flash("notice", "Account information updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    res.status(501).render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

// Process password change
accountController.changePassword = async function (req, res) {
  const nav = await utilities.getNav()
  const { account_id, current_password, new_password, confirm_password } = req.body

  // Verify the account_id matches the logged-in user
  if (parseInt(account_id) !== res.locals.accountData.account_id) {
    req.flash("notice", "You can only update your own account.")
    return res.redirect("/account/")
  }

  // Validate new passwords match
  if (new_password !== confirm_password) {
    req.flash("notice", "New passwords do not match.")
    return res.redirect(`/account/update/${account_id}`)
  }

  // Validate new password strength (same requirements as registration)
  if (new_password.length < 12) {
    req.flash("notice", "New password must be at least 12 characters long.")
    return res.redirect(`/account/update/${account_id}`)
  }

  // Check for required character types
  const hasUppercase = /[A-Z]/.test(new_password);
  const hasLowercase = /[a-z]/.test(new_password);
  const hasNumbers = /\d/.test(new_password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(new_password);

  if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecial) {
    req.flash("notice", "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")
    return res.redirect(`/account/update/${account_id}`)
  }

  // Get current account data to verify current password
  const accountData = await accountModel.getAccountById(account_id)
  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/")
  }

  // Verify current password
  const bcrypt = require("bcryptjs")
  const validPassword = await bcrypt.compare(current_password, accountData.account_password)
  if (!validPassword) {
    req.flash("notice", "Current password is incorrect.")
    return res.redirect(`/account/update/${account_id}`)
  }

  // Hash new password and update
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(new_password, saltRounds)

  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (updateResult) {
    req.flash("notice", "Password changed successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password change failed.")
    res.redirect(`/account/update/${account_id}`)
  }
}

// Process logout
accountController.logoutAccount = async function (req, res) {
  // Clear the JWT cookie
  res.clearCookie("jwt")

  // Set a logout success message
  req.flash("notice", "You have been successfully logged out.")

  // Redirect to home page
  res.redirect("/")
}

// Build the login view
accountController.buildLogin = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("account/login", { title: "Login", nav, errors: null })
}
/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function (req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult && regResult.rows) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }
}

 
 
 
/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

accountController.accountLogin = accountLogin

module.exports = accountController
