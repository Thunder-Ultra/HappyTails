require("dotenv").config({ path: "./awsDBCredintials.env", quiet: true });

// db-pool.js
const mariadb = require("mariadb");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first"); // prefer IPv4 for all lookups

// Create a pool of connections
const pool = mariadb.createPool({
  // host: process.env.AWS_RDS_HOST, // AWS RDS endpoint
  // Using ipv4 address the host name seems to fail everytime
  host: "13.62.131.37", // IPv4 address of RDS
  port: 3306,
  user: "admin",
  password: process.env.AWS_RDS_PASSWORD, // Your DB password
  // database: "happytails",
  connectionLimit: 10, // max connections in pool
  connectTimeout: 20000, // 10s timeout
  family: 4, // force IPv4
});

// Helper function to get a connection from the pool
async function query(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(sql, params);
    return result;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  } finally {
    if (conn) conn.release(); // always release back to pool
  }
}

// Example usage
(async () => {
  try {
    const tables = await query("SHOW DATABASES");
    console.log("Tables:", tables);
  } catch (err) {
    console.error("Error querying database:", err);
  }
})();

module.exports = { pool, query };

// module.exports = { connectToDatabase, getDb };
