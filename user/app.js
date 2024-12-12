const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const userRoutes = require("./routes/user.routes");
const cookierParser = require("cookie-parser");
const connectDB = require("./db/db");

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookierParser());

app.use("/", userRoutes);

module.exports = app;
