const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', alertController.getAll);
router.put('/:id/status', alertController.updateStatus);
router.post('/trigger', alertController.triggerJob);

module.exports = router;
