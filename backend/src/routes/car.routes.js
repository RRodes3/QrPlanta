const express = require('express');
const router = express.Router();

const authMiddlewarte = require('../middleware/auth.middleware');
const {
    getCars,
    getCarById,
    getCarByQrValue,
} = require('../controllers/car.controller');

router.use(authMiddlewarte);

router.get('/', getCars);
router.get('/qr/:qrValue', getCarByQrValue);
router.get('/:id', getCarById);

module.exports = router;