const pool = require('../config/database');

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, COUNT(a.id) as assigned_assets
       FROM users u
       LEFT JOIN assets a ON a.assigned_to = u.id
       GROUP BY u.id
       ORDER BY u.name`
    );
    res.json({ users: rows.map(sanitizeUser) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, COUNT(a.id) as assigned_assets
       FROM users u
       LEFT JOIN assets a ON a.assigned_to = u.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: sanitizeUser(rows[0]) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fields = ['name', 'department', 'role', 'phone', 'avatar_url'];
    const updates = [];
    const params = [];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    res.json({ user: sanitizeUser(rows[0]) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
