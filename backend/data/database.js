const mariadb = require("mariadb");

let database;

async function connectToDatabase() {
  database = await mariadb.createPool({
    host: "localhost",
    user: "odms",
    password: "password",
    connectionLimit: 10,
    database: "HappyTails",
  });
}

function getDb() {
  if (!database) {
    throw new Error("Database not connected!");
  } else {
    return database;
  }
}

module.exports = { connectToDatabase, getDb };
