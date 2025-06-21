module.exports = {
  development: {
    username: "postgres",
    password: "UHm8g167",
    database: "erpdb",
    host: "localhost",
    port: 5432,
    dialect: "postgres",
    logging: false
  },
  test: {
    username: "postgres",
    password: "UHm8g167",
    database: "erpdb_test",
    host: "localhost",
    port: 5432,
    dialect: "postgres",
    logging: false
  },
  production: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "UHm8g167",
    database: process.env.DB_NAME || "erpdb",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false
  }
};
