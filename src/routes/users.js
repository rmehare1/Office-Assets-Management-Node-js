const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);

module.exports = router;
