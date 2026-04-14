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

exports.getAll = async (req, res) => {
  try {
    // Only admins should be able to call this (checked in routes)
    const [rows] = await pool.query(
      `SELECT t.*, a.name AS asset_name, u.name AS user_name
       FROM tickets t
       LEFT JOIN assets a ON t.asset_id = a.id
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    );
    res.json({ tickets: rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['pending', 'approved', 'rejected', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await pool.query(
      `UPDATE tickets SET status = ?, rejection_reason = ? WHERE id = ?`,
      [status, status === 'rejected' ? (rejection_reason || null) : null, id]
    );

    const [rows] = await pool.query(
      `SELECT t.*, a.name AS asset_name, u.name AS user_name
       FROM tickets t
       LEFT JOIN assets a ON t.asset_id = a.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ ticket: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.cancelTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ticket exists, belongs to user, and is pending
    const [existing] = await pool.query(
      'SELECT status FROM tickets WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (existing[0].status !== 'pending') {
      return res.status(400).json({ message: 'Only pending tickets can be cancelled' });
    }

    await pool.query(
      "UPDATE tickets SET status = 'closed', notes = CONCAT(IFNULL(notes, ''), '\nUser cancelled the ticket.') WHERE id = ?",
      [id]
    );

    res.json({ message: 'Ticket cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { type, asset_id, notes } = req.body;

    // Verify ticket exists, belongs to user, and is pending
    const [existing] = await pool.query(
      'SELECT status FROM tickets WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (existing[0].status !== 'pending') {
      return res.status(400).json({ message: 'Only pending tickets can be edited' });
    }

    // Prepare update fields
    const updates = [];
    const params = [];

    if (type) {
      if (!['new_asset_request', 'return_asset'].includes(type)) {
        return res.status(400).json({ message: 'Invalid type' });
      }
      updates.push('type = ?');
      params.push(type);
    }

    if (asset_id !== undefined) {
      updates.push('asset_id = ?');
      params.push(asset_id);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    params.push(id);
    await pool.query(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [rows] = await pool.query(
      `SELECT t.*, a.name AS asset_name
       FROM tickets t
       LEFT JOIN assets a ON t.asset_id = a.id
       WHERE t.id = ?`,
      [id]
    );

    res.json({ ticket: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
