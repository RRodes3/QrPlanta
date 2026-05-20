const express = require('express');
const multer = require('multer');

const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

const {
    importCarsFromFile,
} = require('../controllers/import.controller');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

router.use(authMiddleware);

router.post(
 '/cars',
 requireRole('ADMIN'),
 upload.single('file'),
 importCarsFromFile
);

module.exports = router;