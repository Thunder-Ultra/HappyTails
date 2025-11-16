const { ConnectSessionKnexStore } = require("connect-session-knex");
const knexConstructor = require("knex");

function createStore() {
  const db = knexConstructor({
    client: "mysql2",
    connection: {
      host: "localhost",
      user: "odms",
      password: "password",
      database: "HappyTails",
    },
  });
  const store = new ConnectSessionKnexStore({
    knex: db,
    tableName: "sessions",
    createTable: true,
    cleanupInterval: 1 * 3600 * 1000, // 1 hour
  });
  return store;
}

function createSessionConfig() {
  return {
    secret: "This is an easy secret",
    cookie: {
      maxAge: 10 * 1000,
    },
    store: createStore(),
    resave: false,
    saveUninitialized: false,
  };
}

module.exports = createSessionConfig;
