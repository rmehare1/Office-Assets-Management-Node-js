const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM locations ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM locations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Location not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const [existing] = await pool.query('SELECT id FROM locations WHERE name = ?', [name]);
    if (existing.length > 0) return res.status(409).json({ message: 'Location name already exists' });

    const id = uuidv4();
    await pool.query('INSERT INTO locations (id, name) VALUES (?, ?)', [id, name]);

    const [rows] = await pool.query('SELECT * FROM locations WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM locations WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Location not found' });

    if (name) {
      const [dup] = await pool.query('SELECT id FROM locations WHERE name = ? AND id != ?', [name, id]);
      if (dup.length > 0) return res.status(409).json({ message: 'Location name already exists' });
    }

    if (name !== undefined) {
      await pool.query('UPDATE locations SET name = ? WHERE id = ?', [name, id]);
    }

    const [rows] = await pool.query('SELECT * FROM locations WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM locations WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Location not found' });

    const [assets] = await pool.query('SELECT id FROM assets WHERE location_id = ? LIMIT 1', [id]);
    if (assets.length > 0) return res.status(400).json({ message: 'Cannot delete location currently in use by an asset' });

    await pool.query('DELETE FROM locations WHERE id = ?', [id]);
    res.json({ message: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
