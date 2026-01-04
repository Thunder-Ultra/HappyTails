const mariadb = require("mariadb");
require("dotenv").config({ quiet: true });

let pool;

async function connectToDatabase() {
  pool = mariadb.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "odms",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "happytails",
    connectionLimit: 10,
  });
  console.log("Database Pool Created");
}

function getDb() {
  if (!pool) {
    throw new Error("Database not connected! Call connectToDatabase first.");
  }
  return pool;
}

module.exports = { connectToDatabase, getDb };
