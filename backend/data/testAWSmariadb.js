require("dotenv").config({ path: "./awsDBCredintials.env", quiet: true });
// const mariadb = require("mariadb");

// let database;

// async function connectToDatabase() {
//   database = await mariadb.createPool({
//     host: process.env.AWS_RDS_HOST,
//     port: 3306,
//     user: "admin",
//     password: process.env.AWS_RDS_PASSWORD,
//     connectionLimit: 10,
//     database: "happytails",
//   });
// }

// function getDb() {
//   if (!database) {
//     throw new Error("Database not connected!");
//   } else {
//     return database;
//   }
// }

// connectToDatabase()
//   .then(async function () {
//     console.log("Sucessfully Connected to Database");
//     const result = await getDb().query("show tables");
//     console.log(result);
//   })
//   .catch((err) => {
//     console.log("Failed to connect to database");
//     console.log(err);
//   });
// // .finally(() => {
// //   console.log(process.env.AWS_RDS_HOST);
// //   console.log(process.env.AWS_RDS_PASSWORD);
// // })

// db.js
// const mariadb = require("mariadb");

// let pool;

// /**
//  * Initialize the MariaDB connection pool
//  */
// async function connectToDatabase() {
//   if (pool) return pool; // Already connected

//   pool = mariadb.createPool({
//     host: process.env.AWS_RDS_HOST, // AWS RDS endpoint
//     port: 3306,
//     user: "admin", // Your DB username
//     password: process.env.AWS_RDS_PASSWORD, // Your DB password
//     database: "happytails", // Default database
//     connectionLimit: 10, // Max connections in pool
//     connectTimeout: 10000, // Optional: 10s connection timeout
//   });

//   // Test connection immediately
//   const conn = await pool.getConnection();
//   await conn.ping(); // Ensure DB is reachable
//   conn.release();

//   console.log("Successfully connected to MariaDB!");
//   return pool;
// }

// /**
//  * Get the pool object
//  */
// function getDb() {
//   if (!pool) {
//     throw new Error("Database not connected! Call connectToDatabase() first.");
//   }
//   return pool;
// }

// /**
//  * Helper function to run queries safely
//  */
// async function query(sql, params = []) {
//   const conn = await getDb().getConnection();
//   try {
//     const result = await conn.query(sql, params);
//     return result;
//   } finally {
//     conn.release();
//   }
// }

// module.exports = { connectToDatabase, getDb, query };

// connectToDatabase();
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
