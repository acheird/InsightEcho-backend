const pool = require("./src/db");

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error", err);
  } else {
    console.log("Database connected successfully!", res.rows);
  }
  pool.end();
});
