const express = require('express')
const router = new express.Router()
const utilities = require('../utilities/')
const errorController = require('../controllers/errorController')

// Route that intentionally throws a 500-type error (Task 3)
router.get('/trigger', utilities.handleErrors(errorController.triggerError))

module.exports = router
