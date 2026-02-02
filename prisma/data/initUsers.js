const pool = require("../../src/services/db");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const userPass = "123";

const DUMMY_EMAILS = [
  "admin1@gmail.com",
  "admin2@gmail.com",
  "admin3@gmail.com",
  "admin4@gmail.com",
  "admin5@gmail.com",
  "johndoe@gmail.com"
];

bcrypt.hash(userPass, saltRounds, async (error, hash) => {
  if (error) {
    console.error("Error hashing password:", error);
    process.exit(1);
  }

  try {
    // Check if data already exists
    const checkSQL = `
      SELECT COUNT(*) AS count 
      FROM public."Users" 
      WHERE "email" = ANY($1)
    `;

    const checkResult = await new Promise((resolve, reject) => {
      pool.query(checkSQL, [DUMMY_EMAILS], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const existingCount = parseInt(checkResult.rows[0].count, 10);

    if (existingCount > 0) {
      console.log("Users data already seeded.");
      return process.exit();
    }

    // Insert if dummy data not seeded
    const insertSQL = `
      INSERT INTO public."Users" ("username", "firstName", "lastName", "email", "password", "role")
      VALUES 
        ('admin1', 'admin1', 'one', 'admin1@gmail.com', $1, 'admin'),
        ('admin2', 'admin2', 'two', 'admin2@gmail.com', $1, 'admin'),
        ('admin3', 'admin3', 'three', 'admin3@gmail.com', $1, 'admin'),
        ('admin4', 'admin4', 'four', 'admin4@gmail.com', $1, 'admin'),
        ('admin5', 'admin5', 'five', 'admin5@gmail.com', $1, 'admin'),
        ('johndoe', 'john',  'doe',  'johndoe@gmail.com', $1, 'member')
    `;

    pool.query(insertSQL, [hash], (err, result) => {
      if (err) {
        console.error("Error inserting Users data:", err);
      } else {
        console.log("Users data successfully inserted!");
      }
      process.exit();
    });

  } catch (err) {
    console.error("Error checking Users table:", err);
    process.exit(1);
  }
});
