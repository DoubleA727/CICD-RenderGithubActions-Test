const express = require('express');
const cookieParser = require("cookie-parser");
const createError = require('http-errors');
const path = require('path');

const passport = require("passport");
const configurePassport = require("./services/passport/passport");


const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use(cookieParser());

configurePassport(passport);
app.use(passport.initialize());


const mainRoute = require('./routers/mainRoute');

app.use(express.static(__dirname + '/public'));

app.use("/api", mainRoute);

// app.use((req, res, next) => {
//   next(createError(404, `Unknown resource ${req.method} ${req.originalUrl}`));
// });

// Ignore Chrome devtools probe
app.get('/.well-known/*', (req, res) => res.status(204).end());

// Ignore missing source maps quietly
app.get(/^\/assets\/.*\.(map)$/, (req, res) => res.status(404).end());

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error);
  res
    .status(error.status || 500)
    .json({ error: error.message || 'Unknown Server Error!' });
});

module.exports = app;
