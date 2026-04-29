const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const {
  registerMovement,
  getMovements,
  getMovementsByCarId,
} = require('../controllers/movement.controller');

router.use(authMiddleware);

router.post('/register', registerMovement);
router.get('/', getMovements);
router.get('/car/:carId', getMovementsByCarId);

module.exports = router;