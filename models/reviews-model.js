const pool = require("../database/index");

/* *******************************
 * Add a new review for a vehicle
 * ***************************** */
async function addReview(inv_id, account_id, review_rating, review_text) {
  try {
    const sql = `
      INSERT INTO reviews (inv_id, account_id, review_rating, review_text)
      VALUES ($1, $2, $3, $4)
      RETURNING review_id
    `;
    const result = await pool.query(sql, [inv_id, account_id, review_rating, review_text]);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
}

/* *******************************
 * Get all reviews for a specific vehicle
 * ***************************** */
async function getReviewsByVehicleId(inv_id) {
  try {
    const sql = `
      SELECT
        r.review_id,
        r.inv_id,
        r.account_id,
        r.review_rating,
        r.review_text,
        r.review_date,
        a.account_firstname,
        a.account_lastname
      FROM reviews r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (error) {
    console.error("Error getting reviews by vehicle ID:", error);
    throw error;
  }
}

/* *******************************
 * Get average rating for a vehicle
 * ***************************** */
async function getAverageRating(inv_id) {
  try {
    const sql = `
      SELECT
        AVG(review_rating) as avg_rating,
        COUNT(*) as review_count
      FROM reviews
      WHERE inv_id = $1
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error getting average rating:", error);
    throw error;
  }
}

/* *******************************
 * Get all reviews by a specific user
 * ***************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT
        r.review_id,
        r.inv_id,
        r.account_id,
        r.review_rating,
        r.review_text,
        r.review_date,
        i.inv_make,
        i.inv_model,
        i.inv_year
      FROM reviews r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  } catch (error) {
    console.error("Error getting reviews by account ID:", error);
    throw error;
  }
}

/* *******************************
 * Update an existing review
 * ***************************** */
async function updateReview(review_id, review_rating, review_text) {
  try {
    const sql = `
      UPDATE reviews
      SET review_rating = $1, review_text = $2, review_date = CURRENT_TIMESTAMP
      WHERE review_id = $3
      RETURNING *
    `;
    const result = await pool.query(sql, [review_rating, review_text, review_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
}

/* *******************************
 * Delete a review
 * ***************************** */
async function deleteReview(review_id) {
  try {
    const sql = "DELETE FROM reviews WHERE review_id = $1";
    const result = await pool.query(sql, [review_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
}

/* *******************************
 * Check if user already reviewed a vehicle
 * ***************************** */
async function hasUserReviewedVehicle(account_id, inv_id) {
  try {
    const sql = `
      SELECT review_id
      FROM reviews
      WHERE account_id = $1 AND inv_id = $2
    `;
    const result = await pool.query(sql, [account_id, inv_id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking if user reviewed vehicle:", error);
    throw error;
  }
}

/* *******************************
 * Get review statistics for all vehicles (for dashboard)
 * ***************************** */
async function getReviewStats() {
  try {
    const sql = `
      SELECT
        i.inv_id,
        i.inv_make,
        i.inv_model,
        AVG(r.review_rating) as avg_rating,
        COUNT(r.review_id) as review_count
      FROM inventory i
      LEFT JOIN reviews r ON i.inv_id = r.inv_id
      GROUP BY i.inv_id, i.inv_make, i.inv_model
      ORDER BY review_count DESC, avg_rating DESC
    `;
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.error("Error getting review statistics:", error);
    throw error;
  }
}

module.exports = {
  addReview,
  getReviewsByVehicleId,
  getAverageRating,
  getReviewsByAccountId,
  updateReview,
  deleteReview,
  hasUserReviewedVehicle,
  getReviewStats
};
