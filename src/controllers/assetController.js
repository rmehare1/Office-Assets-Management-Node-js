const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function logAssetAction(assetId, req, action, details = null) {
  try {
    const userId = req.user.id;
    const userName = req.user.name || 'Unknown User';
    const logId = uuidv4();
    await pool.query(
      'INSERT INTO asset_audit_logs (id, asset_id, user_id, user_name, action, details) VALUES (?, ?, ?, ?, ?, ?)',
      [logId, assetId, userId, userName, action, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('Audit Log Error:', err);
    // Don't fail the main request if logging fails
  }
}

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
    console.error('getAll Error:', err);
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
    console.error('getById Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.lookupByCode = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'Missing required query parameter: code' });
    }

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
       WHERE a.serial_number = ? OR a.barcode_value = ?`,
      [code, code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json({ asset: rows[0] });
  } catch (err) {
    console.error('lookupByCode Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, category_id, status_id, assigned_to, serial_number, barcode_value, location_id, location_name, purchase_date, purchase_price, image_url, notes, last_service_date, decommissioned_at, decommission_method, recycler_name, certificate_number } = req.body;

    if (!name || !category_id || !status_id || !serial_number || !purchase_date || purchase_price == null) {
      return res.status(400).json({ message: 'Missing required fields: name, category_id, status_id, serial_number, purchase_date, purchase_price' });
    }

    const [existing] = await pool.query('SELECT id FROM assets WHERE serial_number = ?', [serial_number]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Serial number already exists' });
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO assets (id, name, category_id, status_id, assigned_to, serial_number, barcode_value, location_id, location_name, purchase_date, purchase_price, image_url, notes, last_service_date, decommissioned_at, decommission_method, recycler_name, certificate_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, category_id, status_id, assigned_to || null, serial_number, barcode_value || null, location_id || null, location_name || '', purchase_date, purchase_price, image_url || null, notes || null, last_service_date || null, decommissioned_at || null, decommission_method || null, recycler_name || null, certificate_number || null]
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
    const asset = rows[0];
    await logAssetAction(id, req, 'Created', { name: asset.name, serial_number: asset.serial_number });
    res.status(201).json({ asset });
  } catch (err) {
    console.error('create Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    const oldAsset = existingRows[0];

    const fields = ['name', 'category_id', 'status_id', 'assigned_to', 'serial_number', 'barcode_value', 'location_id', 'location_name', 'purchase_date', 'purchase_price', 'image_url', 'notes', 'last_service_date', 'decommissioned_at', 'decommission_method', 'recycler_name', 'certificate_number'];
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

    // Identify what changed for the log
    const changedFields = {};
    for (const field of fields) {
      if (req.body[field] !== undefined && req.body[field] != oldAsset[field]) {
        changedFields[field] = { from: oldAsset[field], to: req.body[field] };
      }
    }

    if (Object.keys(changedFields).length > 0) {
      let action = 'Updated';
      if (changedFields.status_id) {
         if (req.body.status_id === 'stat_5') action = 'Decommissioned';
      }
      await logAssetAction(id, req, action, changedFields);
    }

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
    console.error('update Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM assets WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const assetToDelete = existing[0];
    await logAssetAction(req.params.id, req, 'Deleted', { name: assetToDelete.name, serial_number: assetToDelete.serial_number });
    
    await pool.query('DELETE FROM assets WHERE id = ?', [req.params.id]);
    res.json({ message: 'Asset deleted' });
  } catch (err) {
    console.error('delete Error:', err);
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
      if (row.status) {
        statusMap[row.status.toLowerCase()] = row.count; 
      }
    }

    const categoryBreakdown = {};
    for (const row of categoryCounts) {
      if (row.category) {
        categoryBreakdown[row.category.toLowerCase()] = row.count;
      }
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
    console.error('getStats Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM asset_audit_logs WHERE asset_id = ? ORDER BY created_at DESC',
      [id]
    );
    res.json({ history: rows });
  } catch (err) {
    console.error('getHistory Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
