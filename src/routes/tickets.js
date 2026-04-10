const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', ticketController.getByUser);
router.post('/', ticketController.create);

module.exports = router;
