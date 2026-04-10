const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

exports.getByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT t.*, a.name AS asset_name
       FROM tickets t
       LEFT JOIN assets a ON t.asset_id = a.id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [userId]
    );
    res.json({ tickets: rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, asset_id, notes } = req.body;

    if (!type || !['new_asset_request', 'return_asset'].includes(type)) {
      return res.status(400).json({ message: 'type must be new_asset_request or return_asset' });
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO tickets (id, user_id, type, asset_id, notes) VALUES (?, ?, ?, ?, ?)`,
      [id, userId, type, asset_id || null, notes || null]
    );

    const [rows] = await pool.query(
      `SELECT t.*, a.name AS asset_name
       FROM tickets t
       LEFT JOIN assets a ON t.asset_id = a.id
       WHERE t.id = ?`,
      [id]
    );
    res.status(201).json({ ticket: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
