const pool = require('../database/')

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Get account by email
 * ********************* */
async function getAccountByEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const account = await pool.query(sql, [account_email])
    return account.rows[0] // Return the first (and should be only) account found
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Get account by ID
 * ********************* */
async function getAccountById(account_id) {
  try {
    const sql = "SELECT * FROM account WHERE account_id = $1"
    const account = await pool.query(sql, [account_id])
    return account.rows[0] // Return the first (and should be only) account found
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Update account information
* *************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email){
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Update account password
* *************************** */
async function updatePassword(account_id, hashedPassword){
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    return await pool.query(sql, [hashedPassword, account_id])
  } catch (error) {
    return error.message
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword }
