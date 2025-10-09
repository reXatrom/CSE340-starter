const reviewsModel = require("../models/reviews-model");
const utilities = require("../utilities/index");

/* *******************************
 * Add a new review for a vehicle
 * ***************************** */
async function addReview(req, res) {
  try {
    const { inv_id, review_rating, review_text } = req.body;

    // Basic validation
    if (!inv_id || !review_rating || !review_text) {
      req.flash("notice", "All fields are required.");
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    // Validate rating is between 1-5
    const rating = parseInt(review_rating);
    if (rating < 1 || rating > 5) {
      req.flash("notice", "Rating must be between 1 and 5.");
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    // Check if user already reviewed this vehicle
    const alreadyReviewed = await reviewsModel.hasUserReviewedVehicle(
      req.session.account_id,
      inv_id
    );

    if (alreadyReviewed) {
      req.flash("notice", "You have already reviewed this vehicle.");
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    // Add the review
    await reviewsModel.addReview(
      inv_id,
      req.session.account_id,
      rating,
      review_text.trim()
    );

    req.flash("notice", "Review added successfully!");
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    console.error("Error adding review:", error);
    req.flash("notice", "Sorry, there was an error adding your review.");
    res.redirect(`/inv/detail/${req.body.inv_id || req.params.inv_id}`);
  }
}

/* *******************************
 * Show edit review form
 * ***************************** */
async function showEditReview(req, res) {
  try {
    const review_id = req.params.review_id;

    // In a real application, you'd want to verify the user owns this review
    // For now, we'll assume the review_id is passed securely

    const reviewData = {
      review_id: review_id,
      inv_id: req.query.inv_id || '',
      current_rating: req.query.rating || '',
      current_text: req.query.text || ''
    };

    res.render("reviews/edit", {
      title: "Edit Review",
      nav,
      reviewData,
      errors: null
    });
  } catch (error) {
    console.error("Error showing edit review form:", error);
    req.flash("notice", "Sorry, there was an error loading the edit form.");
    res.redirect("/account/reviews");
  }
}

/* *******************************
 * Update an existing review
 * ***************************** */
async function updateReview(req, res) {
  try {
    const { review_id, review_rating, review_text } = req.body;

    // Basic validation
    if (!review_id || !review_rating || !review_text) {
      req.flash("notice", "All fields are required.");
      return res.redirect(`/reviews/edit/${review_id}`);
    }

    // Validate rating is between 1-5
    const rating = parseInt(review_rating);
    if (rating < 1 || rating > 5) {
      req.flash("notice", "Rating must be between 1 and 5.");
      return res.redirect(`/reviews/edit/${review_id}`);
    }

    // Update the review
    await reviewsModel.updateReview(review_id, rating, review_text.trim());

    req.flash("notice", "Review updated successfully!");
    res.redirect("/account/reviews");
  } catch (error) {
    console.error("Error updating review:", error);
    req.flash("notice", "Sorry, there was an error updating your review.");
    res.redirect(`/reviews/edit/${req.body.review_id}`);
  }
}

/* *******************************
 * Delete a review
 * ***************************** */
async function deleteReview(req, res) {
  try {
    const review_id = req.params.review_id;
    const inv_id = req.query.inv_id;

    // Delete the review
    const deleted = await reviewsModel.deleteReview(review_id);

    if (deleted) {
      req.flash("notice", "Review deleted successfully!");
    } else {
      req.flash("notice", "Review not found or could not be deleted.");
    }

    // Redirect to appropriate page
    if (inv_id) {
      res.redirect(`/inv/detail/${inv_id}`);
    } else {
      res.redirect("/account/reviews");
    }
  } catch (error) {
    console.error("Error deleting review:", error);
    req.flash("notice", "Sorry, there was an error deleting your review.");
    res.redirect("/account/reviews");
  }
}

/* *******************************
 * Show all reviews by current user
 * ***************************** */
async function showUserReviews(req, res) {
  try {
    const account_id = req.session.account_id;

    if (!account_id) {
      req.flash("notice", "Please log in to view your reviews.");
      return res.redirect("/account/login");
    }

    const userReviews = await reviewsModel.getReviewsByAccountId(account_id);

    res.render("reviews/user-reviews", {
      title: "My Reviews",
      nav,
      reviews: userReviews,
      errors: null
    });
  } catch (error) {
    console.error("Error showing user reviews:", error);
    req.flash("notice", "Sorry, there was an error loading your reviews.");
    res.redirect("/account");
  }
}

module.exports = {
  addReview,
  showEditReview,
  updateReview,
  deleteReview,
  showUserReviews
};
