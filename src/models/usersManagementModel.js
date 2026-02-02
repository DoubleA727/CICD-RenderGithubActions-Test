const pool = require('../services/db')

// GET /users
module.exports.getAllUsers = (callback) => {
  const SQL = `
    SELECT 
      "userId"    AS userId,
      username,
      "firstName" AS firstName,
      "lastName"  AS lastName,
      email,
      "imageUrl"  AS imageUrl,
      role,
      "createdAt" AS createdAt
    FROM "Users"
    ORDER BY "createdAt" DESC;
  `;

  pool.query(SQL, callback);
};

// UPDATE /users/:userId
module.exports.updateUserById = (userId, fields, callback) => {
  const updates = [];
  const values = [];
  let index = 1;

  for (const key in fields) {
    if (fields[key] !== undefined) {
      updates.push(`"${key}" = $${index}`);
      values.push(fields[key]);
      index++;
    }
  }

  if (updates.length === 0) {
    return callback(null, { rowCount: 0 });
  }

  const SQL = `
    UPDATE "Users"
    SET ${updates.join(', ')}
    WHERE "userId" = $${index}
      AND role <> 'deleted'
  `;

  values.push(userId);
  pool.query(SQL, values, callback);
};


// SOFT DELETE /users/:userId
module.exports.softDeleteUserById = (userId, callback) => {
  const SQL = `
    UPDATE "Users"
    SET
      username    = CONCAT('deleted_', "userId"),
      "firstName" = 'Deleted',
      "lastName"  = 'User',
      email       = CONCAT('deleted_', "userId", '@example.invalid'),
      "imageUrl"  = './assets/images/profile-pic.png',
      password    = CONCAT('deleted_', "userId"),
      role        = 'deleted'
    WHERE "userId" = $1
      AND role <> 'deleted'
  `;
  pool.query(SQL, [userId], callback);
};


