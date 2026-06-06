const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const userRoutes = require("./src/routes/userRoutes");
const roomRoutes = require('./src/routes/roomRoutes');
const matchRoutes = require('./src/routes/matchRoutes');
const submissionRoutes = require('./src/routes/submissionRoutes');
const { ROUTE_PREFIX } = require("./src/constants/routes");
const corsConfig = require("./src/config/corsConfig");

const app = express();

app.use(cors(corsConfig));
app.use(cookieParser())
app.use(express.json());
app.use(`${ROUTE_PREFIX.API}${ROUTE_PREFIX.USERS}`, userRoutes);
app.use(`${ROUTE_PREFIX.API}${ROUTE_PREFIX.ROOM}`,  roomRoutes );
app.use(`${ROUTE_PREFIX.API}${ROUTE_PREFIX.MATCH}`, matchRoutes);
app.use(`${ROUTE_PREFIX.API}${ROUTE_PREFIX.SUBMISSION}`, submissionRoutes);

module.exports = app;
