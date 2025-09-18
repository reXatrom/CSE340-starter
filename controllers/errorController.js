// Intentionally trigger a 500-type error via the controller
// This route is wrapped with utilities.handleErrors so the global
// error handler will render the error view

const errorController = {}

errorController.triggerError = async function (req, res, next) {
  // Suggested by: Throw exceptions in Node
  const err = new Error("Intentional server error for testing (Task 3)")
  err.status = 500
  throw err
}

module.exports = errorController
