const pool = require('../config/db');

// ADD
const addSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      category,
      cost,
      currency,
      billing_cycle,
      start_date,
      renewal_date,
      status,
      is_trial,
      trial_end_date,
      notes,
      color,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO subscriptions 
      (user_id, name, category, cost, currency, billing_cycle, start_date, renewal_date, status, is_trial, trial_end_date, notes, color)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        userId,
        name,
        category,
        cost,
        currency || 'INR',
        billing_cycle,
        start_date,
        renewal_date,
        status || 'active',
        is_trial || false,
        trial_end_date || null,
        notes || '',
        color || '#93C5FD',
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding subscription' });
  }
};

// GET ALL
const getSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id=$1 ORDER BY id DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
};

// UPDATE
const updateSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const {
      name,
      category,
      cost,
      currency,
      billing_cycle,
      start_date,
      renewal_date,
      status,
      is_trial,
      trial_end_date,
      notes,
      color,
    } = req.body;

    const result = await pool.query(
      `UPDATE subscriptions SET
        name=$1,
        category=$2,
        cost=$3,
        currency=$4,
        billing_cycle=$5,
        start_date=$6,
        renewal_date=$7,
        status=$8,
        is_trial=$9,
        trial_end_date=$10,
        notes=$11,
        color=$12
       WHERE id=$13 AND user_id=$14
       RETURNING *`,
      [
        name,
        category,
        cost,
        currency,
        billing_cycle,
        start_date,
        renewal_date,
        status,
        is_trial,
        trial_end_date || null,
        notes || '',
        color,
        id,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Update failed' });
  }
};

// DELETE
const deleteSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await pool.query(
      'DELETE FROM subscriptions WHERE id=$1 AND user_id=$2',
      [id, userId]
    );

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

module.exports = {
  addSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
};