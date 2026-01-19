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

const runsGetRoutes = require("./routes/runs.get.routes.js");
const runsPostRoutes = require("./routes/runs.post.routes.js");

/* ================================================================================================= */
/*  ROUTES                                                                                           */
/* ================================================================================================= */

// Health check routes
app.get("/", (req, res) => {
  res.send("Hi there! This is a runners app server.");
});

app.get("/server-runtime", (req, res) => {
  const serverTimeCurrent = (Date.now() - serverTimeStart) / 1000;
  const serverTimeCurrentRounded = Math.round(serverTimeCurrent * 10) / 10;
  res.send(`Server is running for ${serverTimeCurrentRounded} s.`);
});

// Runs routes
app.use("/runs", runsGetRoutes);
app.use("/runs", runsPostRoutes);

/* ================================================================================================= */
/*  ERROR HANDLERS                                                                                   */
/* ================================================================================================= */

const {
  jsonSyntaxErrorHandler,
  dbErrorHandler,
  finalErrorHandler,
} = require("./middleware/error-handlers.js");

app.use(jsonSyntaxErrorHandler);
app.use(dbErrorHandler);
app.use(finalErrorHandler);

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = app;
