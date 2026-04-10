const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departments ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Department not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const [existing] = await pool.query('SELECT id FROM departments WHERE name = ?', [name]);
    if (existing.length > 0) return res.status(409).json({ message: 'Department name already exists' });

    const id = uuidv4();
    await pool.query('INSERT INTO departments (id, name) VALUES (?, ?)', [id, name]);

    const [rows] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM departments WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Department not found' });

    if (name) {
      const [dup] = await pool.query('SELECT id FROM departments WHERE name = ? AND id != ?', [name, id]);
      if (dup.length > 0) return res.status(409).json({ message: 'Department name already exists' });
    }

    if (name !== undefined) {
      await pool.query('UPDATE departments SET name = ? WHERE id = ?', [name, id]);
    }

    const [rows] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM departments WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Department not found' });

    await pool.query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
