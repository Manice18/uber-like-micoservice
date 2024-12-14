const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const rideRoutes = require("./routes/ride.routes");
const cookierParser = require("cookie-parser");
const connectDB = require("./db/db");
const rabbitMq = require("./service/rabbit");

connectDB();
rabbitMq.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookierParser());

app.use("/", rideRoutes);

module.exports = app;
