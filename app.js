
const express = require("express");
const userRoutes = require("./src/routes/userRoutes");
const { ROUTE_PREFIX } = require("./src/constants/routes");

const app = express();

app.use(express.json());
app.use(`${ROUTE_PREFIX.API}${ROUTE_PREFIX.USERS}`, userRoutes);

module.exports = app;
