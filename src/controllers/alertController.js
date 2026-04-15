const pool = require('../config/database');
const { triggerManualCheck } = require('../jobs/maintenanceJob');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ma.*, a.name as asset_name, a.serial_number
      FROM maintenance_alerts ma
      JOIN assets a ON ma.asset_id = a.id
      ORDER BY ma.created_at DESC
    `);
    res.json({ alerts: rows });
  } catch (err) {
    console.error('getAll Alerts Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Notified', 'Completed', 'Dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const [existing] = await pool.query('SELECT * FROM maintenance_alerts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    const alert = existing[0];

    // Update alert status
    await pool.query('UPDATE maintenance_alerts SET status = ? WHERE id = ?', [status, id]);

    // If marked as Completed, update the asset's last_service_date
    if (status === 'Completed' && alert.status !== 'Completed') {
      await pool.query('UPDATE assets SET last_service_date = CURRENT_DATE WHERE id = ?', [alert.asset_id]);
    }

    // Return the updated alert
    const [updatedRows] = await pool.query(`
      SELECT ma.*, a.name as asset_name, a.serial_number
      FROM maintenance_alerts ma
      JOIN assets a ON ma.asset_id = a.id
      WHERE ma.id = ?
    `, [id]);

    res.json({ alert: updatedRows[0] });
  } catch (err) {
    console.error('updateStatus Alerts Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Endpoint to manually trigger the job
exports.triggerJob = async (req, res) => {
  try {
    const result = await triggerManualCheck();
    res.json(result);
  } catch (err) {
    console.error('triggerJob Errors:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
