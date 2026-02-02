require('dotenv').config();
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production'; // or whatever you prefer

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

function normalizeValues(values) {
  if (values === undefined || values === null) return [];
  return Array.isArray(values) ? values : [values];
}

function convertPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function query(sql, valuesOrCb, maybeCb) {
  let callback = maybeCb;
  let values = valuesOrCb;

  if (typeof valuesOrCb === 'function') {
    callback = valuesOrCb;
    values = [];
  }

  const text = convertPlaceholders(sql);
  const params = normalizeValues(values);

  pool
    .query(text, params)
    .then(res => {
      const result = {
        rows: res.rows,
        rowCount: res.rowCount,
        affectedRows: res.rowCount,
        insertId:
          res.rows &&
          res.rows[0] &&
          (res.rows[0].id || res.rows[0].insertId)
            ? (res.rows[0].id || res.rows[0].insertId)
            : null
      };
      callback && callback(null, result);
    })
    .catch(err => {
      callback && callback(err);
    });
}

module.exports = {
  query,
  pool
};
