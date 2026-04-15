const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

// Run daily at midnight: '0 0 * * *'
// For testing purposes, we could run it every minute, but we'll stick to daily.
const startMaintenanceJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled maintenance check...');
    try {
      // Find assets that are 180 days past their last_service_date or purchase_date
      const [overdueAssets] = await pool.query(`
        SELECT id, name, COALESCE(last_service_date, purchase_date) as last_date,
               DATEDIFF(CURRENT_DATE, COALESCE(last_service_date, purchase_date)) as overdue_days
        FROM assets
        WHERE DATEDIFF(CURRENT_DATE, COALESCE(last_service_date, purchase_date)) > 180
      `);

      for (const asset of overdueAssets) {
        // Check if there is already an active alert for this asset
        const [existingAlerts] = await pool.query(
          `SELECT id FROM maintenance_alerts 
           WHERE asset_id = ? AND status IN ('Pending', 'Notified')`,
          [asset.id]
        );

        if (existingAlerts.length === 0) {
          const alertId = uuidv4();
          await pool.query(
            `INSERT INTO maintenance_alerts (id, asset_id, status, overdue_days, message)
             VALUES (?, ?, ?, ?, ?)`,
            [
              alertId, 
              asset.id, 
              'Pending', 
              asset.overdue_days, 
              `Asset "${asset.name}" is overdue for maintenance by ${asset.overdue_days - 180} days. Last serviced/purchased on ${new Date(asset.last_date).toISOString().split('T')[0]}.`
            ]
          );
          console.log(`Created new maintenance alert for asset: ${asset.name}`);
        }
      }
      console.log('Maintenance check completed.');
    } catch (error) {
      console.error('Error running maintenance job:', error);
    }
  });
};

// Also export a manual trigger for testing/developer use
const triggerManualCheck = async () => {
  console.log('Running manual maintenance check...');
  try {
    const [overdueAssets] = await pool.query(`
      SELECT id, name, COALESCE(last_service_date, purchase_date) as last_date,
             DATEDIFF(CURRENT_DATE, COALESCE(last_service_date, purchase_date)) as overdue_days
      FROM assets
      WHERE DATEDIFF(CURRENT_DATE, COALESCE(last_service_date, purchase_date)) > 180
    `);

    let createdCount = 0;
    for (const asset of overdueAssets) {
      const [existingAlerts] = await pool.query(
        `SELECT id FROM maintenance_alerts 
         WHERE asset_id = ? AND status IN ('Pending', 'Notified')`,
        [asset.id]
      );

      if (existingAlerts.length === 0) {
        const alertId = uuidv4();
        await pool.query(
          `INSERT INTO maintenance_alerts (id, asset_id, status, overdue_days, message)
           VALUES (?, ?, ?, ?, ?)`,
          [
            alertId, 
            asset.id, 
            'Pending', 
            asset.overdue_days, 
            `Asset "${asset.name}" is overdue for maintenance by ${asset.overdue_days - 180} days. Last serviced/purchased on ${new Date(asset.last_date).toISOString().split('T')[0]}.`
          ]
        );
        createdCount++;
      }
    }
    console.log(`Manual maintenance check completed. Created ${createdCount} alerts.`);
    return { success: true, count: createdCount };
  } catch (error) {
    console.error('Error running manual maintenance check:', error);
    throw error;
  }
};

module.exports = { startMaintenanceJob, triggerManualCheck };
