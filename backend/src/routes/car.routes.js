const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const {
    getCars,
    getCarById,
    getCarByQrValue,
    searchCarsForQrExport,
    exportCarQrsPdf,
} = require('../controllers/car.controller');

router.use(authMiddleware);

router.get('/', getCars);
router.get('/qr/:qrValue', getCarByQrValue);
router.get('/export/search', requireRole('ADMIN'), searchCarsForQrExport);
router.post('/export-qrs', requireRole('ADMIN'), exportCarQrsPdf);
router.get('/:id', getCarById);

module.exports = router;