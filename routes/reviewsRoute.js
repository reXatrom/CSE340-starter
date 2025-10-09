const express = require("express");
const router = new express.Router();
const reviewsController = require("../controllers/reviewsController");
const utilities = require("../utilities/index");

/* *******************************
 * Add Review Route
 * POST: /add
 * ***************************** */
router.post(
  "/add",
  utilities.checkLogin,
  reviewsController.addReview
);

/* *******************************
 * Edit Review Route
 * GET: /edit/:review_id
 * ***************************** */
router.get(
  "/edit/:review_id",
  utilities.checkLogin,
  reviewsController.showEditReview
);

/* *******************************
 * Update Review Route
 * POST: /update
 * ***************************** */
router.post(
  "/update",
  utilities.checkLogin,
  reviewsController.updateReview
);

/* *******************************
 * Delete Review Route
 * GET: /delete/:review_id
 * ***************************** */
router.get(
  "/delete/:review_id",
  utilities.checkLogin,
  reviewsController.deleteReview
);

/* *******************************
 * User Reviews Route
 * GET: /user-reviews
 * ***************************** */
router.get(
  "/user-reviews",
  utilities.checkLogin,
  reviewsController.showUserReviews
);

module.exports = router;
