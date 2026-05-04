const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const userRoutes = require("./src/routes/userRoutes");
const roomRoutes = require('./src/routes/roomRoutes')
const { ROUTE_PREFIX, ROOM_ROUTES } = require("./src/constants/routes");
const corsConfig = require("./src/config/corsConfig");

const app = express();

app.use(cors(corsConfig));
app.use(cookieParser())
app.use(express.json());
app.use(`${ROUTE_PREFIX.API}${ROUTE_PREFIX.USERS}`, userRoutes);
app.use(`${ROUTE_PREFIX.API}${ROUTE_PREFIX.ROOM}`,  roomRoutes );

module.exports = app;
