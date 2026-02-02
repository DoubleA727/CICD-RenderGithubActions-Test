const pool = require('../services/db');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bcrypt = require("bcrypt");
const crypto = require("crypto");

// 1) POST /api/register
module.exports.insertUser = (data, callback) => {
  const SQL = `
        SELECT * FROM public.register(?, ?, ?, ?, ?);
    `

  const VALUES = [
    data.username,
    data.firstName,
    data.lastName,
    data.email,
    data.password
  ];

  pool.query(SQL, VALUES, callback);
};

// 2) POST /api/login
module.exports.login = (data, callback) => {
  const SQL = `SELECT * FROM public.find_user_for_login(?);`;
  const VALUES = [data.identifier]; // identifier is username OR email
  pool.query(SQL, VALUES, callback);
};

// 2.5 GET /users/:user_id
module.exports.findUserById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM get_user_details_joined($1);
  `;

  const VALUES = [data.user_id];
  // console.log(VALUES)
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// get user tier
module.exports.gettingUserTier = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT "tierId" FROM "UserTier" WHERE "userId"=?;
  `;

  const VALUES = [data.user_id];
  // console.log(VALUES)
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// 3) PUT /users/:user_id
module.exports.updateUser = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT editUser($1, $2, $3, $4, $5, $6);
  `;

  //null values making sure odnt overwrite blacnks
  const VALUES = [
    data.user_id,
    data.username || null,
    data.firstName || null,
    data.lastName || null,
    data.email || null,
    data.password || null
  ];

  // console.log(VALUES);

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// 7) DELETE
module.exports.deleteUser = (data, callback) => {
  const SQLSTATEMENT = `SELECT deleteUser($1);`;
  const VALUES = [data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
}

module.exports.updateProfilePic = async function (data, callback) {
  try {
    const updatedUser = await prisma.users.update({
      where: { userId: data.userId },
      data: { imageUrl: data.imageUrl },
    });

    return callback(null, updatedUser);
  } catch (err) {
    return callback(err, null);
  }
};

// Find oauth account mapping
module.exports.findOauthAccount = (data, callback) => {
  const SQL = `
    SELECT user_id
    FROM oauth_accounts
    WHERE provider = $1 AND provider_user_id = $2
    LIMIT 1;
  `;
  pool.query(SQL, [data.provider, data.providerUserId], callback);
};

// Link oauth account to a user
module.exports.linkOauthAccount = (data, callback) => {
  const SQL = `
    INSERT INTO oauth_accounts (provider, provider_user_id, user_id, email)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (provider, provider_user_id)
    DO UPDATE SET user_id = EXCLUDED.user_id, email = EXCLUDED.email
    RETURNING user_id;
  `;
  pool.query(SQL, [data.provider, data.providerUserId, data.userId, data.email], callback);
};

// Find user by email
module.exports.findUserByEmail = (data, callback) => {
  const SQL = `
    SELECT userid, username, firstname, lastname, email, role
    FROM users
    WHERE email = $1
    LIMIT 1;
  `;
  pool.query(SQL, [data.email], callback);
};

// Create a user for OAuth login (password can be NULL if your schema allows it)
module.exports.createOauthUser = (data, callback) => {
  const SQL = `
    INSERT INTO users (username, firstname, lastname, email, password, role)
    VALUES ($1, $2, $3, $4, NULL, COALESCE($5, 'user'))
    RETURNING userid, role;
  `;
  pool.query(
    SQL,
    [data.username, data.firstName, data.lastName, data.email, data.role],
    callback
  );
};

// Get role by user id (for JWT payload)
module.exports.getUserRoleById = (data, callback) => {
  const SQL = `SELECT role FROM users WHERE userid = $1 LIMIT 1;`;
  pool.query(SQL, [data.userId], callback);
};

// Find user by email (Prisma)
module.exports.findUserByEmailPrisma = async ({ email }) => {
  return prisma.users.findUnique({
    where: { email },
    select: { userId: true, role: true },
  });
};

// Find oauth account link (Prisma)
module.exports.findOauthAccount = async ({ provider, providerUserId }) => {
  return prisma.oauthAccount.findUnique({
    where: {
      provider_providerUserId: { provider, providerUserId },
    },
    select: { userId: true },
  });
};

// Link oauth account (Prisma)
module.exports.linkOauthAccount = async ({ provider, providerUserId, userId, email }) => {
  return prisma.oauthAccount.upsert({
    where: {
      provider_providerUserId: { provider, providerUserId },
    },
    create: {
      provider,
      providerUserId,
      userId,
      email: email || null,
    },
    update: {
      userId,
      email: email || null,
    },
    select: { userId: true },
  });
};

// Get user role (Prisma)
module.exports.getUserRoleByIdPrisma = async ({ userId }) => {
  return prisma.users.findUnique({
    where: { userId },
    select: { role: true },
  });
};

// Create OAuth user (password required in your schema!)
module.exports.createOauthUserPrisma = async ({ username, firstName, lastName, email }) => {
  const randomPassword = "oauth_" + crypto.randomBytes(18).toString("hex");
  const passwordHash = await bcrypt.hash(randomPassword, 10);

  return prisma.users.create({
    data: {
      username,
      firstName,
      lastName,
      email,
      password: passwordHash,
      role: "member",
    },
    select: { userId: true, role: true },
  });
};

module.exports.hardDeleteUserById = async (userId) => {
  // run in order (child tables first)
  await pool.query('DELETE FROM "UserTier" WHERE "userId" = $1;', [userId]);
  await pool.query('DELETE FROM "UserMerch" WHERE "userId" = $1;', [userId]);
  await pool.query('DELETE FROM "Reviews" WHERE "userId" = $1;', [userId]);

  // orders (if your actual table names differ, adjust)
  await pool.query(
    'DELETE FROM "OrderItem" WHERE "orderId" IN (SELECT id FROM "Order" WHERE "userId" = $1);',
    [userId]
  );
  await pool.query('DELETE FROM "Order" WHERE "userId" = $1;', [userId]);

  await pool.query('DELETE FROM oauth_accounts WHERE user_id = $1;', [userId]);
  await pool.query('DELETE FROM "UserAchievement" WHERE "userId" = $1;', [userId]);

  // finally delete user
  await pool.query('DELETE FROM "Users" WHERE "userId" = $1;', [userId]);

  return true;
};



module.exports.deleteUserByEmail = (data, callback) => {
  const SQL = `DELETE FROM "Users" WHERE email = $1 RETURNING "userId";`;
  pool.query(SQL, [data.email], callback);
};

module.exports.findUserIdByEmail = (data, callback) => {
  const SQL = `SELECT "userId" FROM "Users" WHERE email = $1 LIMIT 1;`;
  pool.query(SQL, [data.email], callback);
};
