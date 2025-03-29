require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS ? "****" : "NOT SET");


// Test the database connection
pool.connect()
  .then(() => console.log("✅ Connected to the database"))
  .catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1); // Exit the app if DB connection fails
  });
  
module.exports = pool;
