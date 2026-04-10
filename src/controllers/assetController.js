const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const { status_id, category_id, search, sort, order, assigned_to } = req.query;
    let sql = `
      SELECT a.*, 
             u.name AS assigned_to_name,
             c.name AS category,
             c.icon AS category_icon,
             s.name AS status,
             s.color AS status_color
      FROM assets a
      LEFT JOIN users u ON a.assigned_to = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN statuses s ON a.status_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status_id) {
      sql += ' AND a.status_id = ?';
      params.push(status_id);
    }
    if (category_id) {
      sql += ' AND a.category_id = ?';
      params.push(category_id);
    }
    if (search) {
      sql += ' AND (a.name LIKE ? OR a.serial_number LIKE ? OR a.location_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (assigned_to) {
      sql += ' AND a.assigned_to = ?';
      params.push(assigned_to);
    }

    const allowedSorts = ['name', 'category', 'status', 'purchase_date', 'purchase_price', 'created_at'];
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY a.${sortField} ${sortOrder}`;

    const [rows] = await pool.query(sql, params);
    
    // Convert property names if strictly needed, though our SELECT returns nice aliases already.
    res.json({ assets: rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, 
              u.name AS assigned_to_name,
              c.name AS category,
              c.icon AS category_icon,
              s.name AS status,
              s.color AS status_color
       FROM assets a
       LEFT JOIN users u ON a.assigned_to = u.id
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN statuses s ON a.status_id = s.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json({ asset: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, category_id, status_id, assigned_to, serial_number, location_id, location_name, purchase_date, purchase_price, image_url, notes } = req.body;

    if (!name || !category_id || !status_id || !serial_number || !purchase_date || purchase_price == null) {
      return res.status(400).json({ message: 'Missing required fields: name, category_id, status_id, serial_number, purchase_date, purchase_price' });
    }

    const [existing] = await pool.query('SELECT id FROM assets WHERE serial_number = ?', [serial_number]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Serial number already exists' });
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO assets (id, name, category_id, status_id, assigned_to, serial_number, location_id, location_name, purchase_date, purchase_price, image_url, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, category_id, status_id, assigned_to || null, serial_number, location_id || null, location_name || '', purchase_date, purchase_price, image_url || null, notes || null]
    );

    const [rows] = await pool.query(
      `SELECT a.*, u.name AS assigned_to_name, c.name AS category, s.name AS status 
       FROM assets a 
       LEFT JOIN users u ON a.assigned_to = u.id 
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN statuses s ON a.status_id = s.id
       WHERE a.id = ?`,
      [id]
    );
    res.status(201).json({ asset: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM assets WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const fields = ['name', 'category_id', 'status_id', 'assigned_to', 'serial_number', 'location_id', 'location_name', 'purchase_date', 'purchase_price', 'image_url', 'notes'];
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

    if (req.body.serial_number) {
      const [dup] = await pool.query('SELECT id FROM assets WHERE serial_number = ? AND id != ?', [req.body.serial_number, id]);
      if (dup.length > 0) {
        return res.status(409).json({ message: 'Serial number already exists' });
      }
    }

    params.push(id);
    await pool.query(`UPDATE assets SET ${updates.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.query(
      `SELECT a.*, u.name AS assigned_to_name, c.name AS category, s.name AS status 
       FROM assets a 
       LEFT JOIN users u ON a.assigned_to = u.id 
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN statuses s ON a.status_id = s.id
       WHERE a.id = ?`,
      [id]
    );
    res.json({ asset: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM assets WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    await pool.query('DELETE FROM assets WHERE id = ?', [req.params.id]);
    res.json({ message: 'Asset deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [statusCounts] = await pool.query(
      `SELECT s.name as status, COUNT(a.id) as count 
       FROM statuses s 
       LEFT JOIN assets a ON s.id = a.status_id 
       GROUP BY s.id, s.name`
    );
    const [categoryCounts] = await pool.query(
      `SELECT c.name as category, COUNT(a.id) as count 
       FROM categories c 
       LEFT JOIN assets a ON c.id = a.category_id 
       GROUP BY c.id, c.name`
    );
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM assets');

    const statusMap = {};
    for (const row of statusCounts) {
      // we still provide keys matching lowercase for legacy compat in dashboard
      // Or we can just pass the real names
      statusMap[row.status.toLowerCase()] = row.count; 
    }

    const categoryBreakdown = {};
    for (const row of categoryCounts) {
      // lowercase for safety if old UI relies on it
      categoryBreakdown[row.category.toLowerCase()] = row.count;
    }

    res.json({
      total: totalRows[0].total,
      available: statusMap['available'] || 0,
      assigned: statusMap['assigned'] || 0,
      maintenance: statusMap['maintenance'] || 0,
      retired: statusMap['retired'] || 0,
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
