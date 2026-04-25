const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const {
  getUsers,
  createUser,
  deleteUser,
} = require('../controllers/user.controller');

router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get('/', getUsers);
router.post('/', createUser);
router.delete('/:id', deleteUser);

module.exports = router;