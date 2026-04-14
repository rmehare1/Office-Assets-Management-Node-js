const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', ticketController.getByUser);
router.post('/', ticketController.create);
router.patch('/:id', ticketController.update);
router.patch('/:id/cancel', ticketController.cancelTicket);

// Admin routes
router.get('/admin', (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
}, ticketController.getAll);

router.patch('/:id/status', (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
}, ticketController.updateStatus);

module.exports = router;
