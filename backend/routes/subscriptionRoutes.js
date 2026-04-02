const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
  addSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');

router.post('/', authMiddleware, addSubscription);
router.get('/', authMiddleware, getSubscriptions);
router.put('/:id', authMiddleware, updateSubscription);
router.delete('/:id', authMiddleware, deleteSubscription);

module.exports = router;