const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const captainRoutes = require("./routes/captain.routes");
const cookierParser = require("cookie-parser");
const connectDB = require("./db/db");
const rabbitMq = require("./service/rabbit");

connectDB();
rabbitMq.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookierParser());

app.use("/", captainRoutes);

module.exports = app;
