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
/*  ROUTES                                                                                           */
/* ================================================================================================= */

app.get("/health", (req,res) => {
  const serverTimeCurrent = (Date.now() - serverTimeStart) / 1000;
  const serverTimeCurrentRounded = Math.round(serverTimeCurrent * 10) / 10;
  res.status(200).json({
    status: "ok",
    message: `Server is running for ${serverTimeCurrentRounded} s.`,
    version: "1.0.0"
  });
})

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
