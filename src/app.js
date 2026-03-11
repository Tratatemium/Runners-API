/* ================================================================================================= */
/*  IMPORTS                                                                                          */
/* ================================================================================================= */

const express = require("express");
const app = express();
const mongoose = require("mongoose");

/* ================================================================================================= */
/*  SERVER UPTIME                                                                                    */
/* ================================================================================================= */

const serverTimeStart = Date.now();

const getUptime = () => {
  const uptime = Date.now() - serverTimeStart;
  const uptimeSeconds = Math.floor(uptime / 1000);

  const hrs = Math.floor(uptimeSeconds / 3600);
  const mins = Math.floor((uptimeSeconds % 3600) / 60);
  const secs = uptimeSeconds % 60;

  const pad = (n) => n.toString().padStart(2, "0");

  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
};

/* ================================================================================================= */
/*  MIDDLEWARE                                                                                       */
/* ================================================================================================= */

app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming path:", req.path);
  next();
});

/* ================================================================================================= */
/*  HEALTH CHECK                                                                                     */
/* ================================================================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    service: "runners-api",
    status: "running",
    uptime: getUptime(),
    version: "1.0.0",
    DBreadyState: mongoose.connection.readyState
  });
});

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: getUptime(),
    version: "1.0.0",
    DBreadyState: mongoose.connection.readyState
  });
});

/* ================================================================================================= */
/*  ROUTER IMPORTS                                                                                   */
/* ================================================================================================= */

const authRouter = require("./routers/auth.router.js");
const usersRouter = require("./routers/users.router.js");
const runsRouter = require("./routers/runs.router.js");

/* ================================================================================================= */
/*  API ROUTERS (VERSIONED)                                                                          */
/* ================================================================================================= */

const v1Router = express.Router();

v1Router.use("/auth", authRouter);
v1Router.use("/users", usersRouter);
v1Router.use("/runs", runsRouter);

app.use("/v1", v1Router);

/* ================================================================================================= */
/*  ERROR HANDLERS                                                                                   */
/* ================================================================================================= */

const {
  jsonSyntaxErrorHandler,
  dbErrorHandler,
  authErrorHandler,
  finalErrorHandler,
} = require("./middleware/error.middleware.js");

app.use(jsonSyntaxErrorHandler);
app.use(dbErrorHandler);
app.use(authErrorHandler);
app.use(finalErrorHandler);

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = app;
