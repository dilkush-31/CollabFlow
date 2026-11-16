const fs = require("fs");
const mysql = require("mysql2/promise");
require("dotenv").config();

// On Aiven, DB_SSL=true and DB_CA_PATH points to the CA certificate file
const sslOptions =
  process.env.DB_SSL === "true"
    ? {
        ca: process.env.DB_CA_CERT || fs.readFileSync(process.env.DB_CA_PATH),
        rejectUnauthorized: true,
      }
    : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslOptions,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;