/* ================================================================================================= */
/*  IMPORTS                                                                                          */
/* ================================================================================================= */

const express = require("express");
const app = express();

/* ================================================================================================= */
/*  SERVER VARIABLES                                                                                 */
/* ================================================================================================= */

const serverTimeStart = Date.now();

/* ================================================================================================= */
/*  MIDDLEWARE                                                                                       */
/* ================================================================================================= */

app.use(express.json());

/* ================================================================================================= */
/*  ROUTE IMPORTS                                                                                    */
/* ================================================================================================= */

const authRoutes = require("./routes/auth.routes.js");
const usersRoutes = require("./routes/users.routes.js");
const runsRoutes = require("./routes/runs.routes.js");

/* ================================================================================================= */
/*  SERVER HEALTH                                                                                    */
/* ================================================================================================= */

const getUptime = () => {
  const uptime = Date.now() - serverTimeStart;
  const uptimeSeconds = Math.floor(uptime / 1000);

  const hrs = Math.floor(uptimeSeconds / 3600);
  const mins = Math.floor((uptimeSeconds % 3600) / 60);
  const secs = uptimeSeconds % 60;

  const pad = (n) => n.toString().padStart(2, "0");

  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
};

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: getUptime(),
    version: "1.0.0",
  });
});

/* ================================================================================================= */
/*  ROUTES                                                                                           */
/* ================================================================================================= */

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/runs", runsRoutes);

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
