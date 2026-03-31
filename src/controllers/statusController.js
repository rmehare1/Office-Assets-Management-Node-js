const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM statuses ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM statuses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Status not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const [existing] = await pool.query('SELECT id FROM statuses WHERE name = ?', [name]);
    if (existing.length > 0) return res.status(409).json({ message: 'Status name already exists' });

    const id = uuidv4();
    await pool.query('INSERT INTO statuses (id, name, color) VALUES (?, ?, ?)', [id, name, color || null]);

    const [rows] = await pool.query('SELECT * FROM statuses WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, color } = req.body;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM statuses WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Status not found' });

    if (name) {
      const [dup] = await pool.query('SELECT id FROM statuses WHERE name = ? AND id != ?', [name, id]);
      if (dup.length > 0) return res.status(409).json({ message: 'Status name already exists' });
    }

    const updates = [];
    const params = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (color !== undefined) { updates.push('color = ?'); params.push(color); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE statuses SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [rows] = await pool.query('SELECT * FROM statuses WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM statuses WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Status not found' });

    // Ensure not referenced
    const [assets] = await pool.query('SELECT id FROM assets WHERE status_id = ? LIMIT 1', [id]);
    if (assets.length > 0) return res.status(400).json({ message: 'Cannot delete status currently in use by an asset' });

    await pool.query('DELETE FROM statuses WHERE id = ?', [id]);
    res.json({ message: 'Status deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
