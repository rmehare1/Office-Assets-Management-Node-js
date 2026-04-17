const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/stats/summary', assetController.getStats);
router.get('/lookup', assetController.lookupByCode);
router.get('/', assetController.getAll);
router.get('/:id', assetController.getById);
router.get('/:id/history', assetController.getHistory);
router.post('/', assetController.create);
router.put('/:id', assetController.update);
router.delete('/:id', assetController.delete);

module.exports = router;
