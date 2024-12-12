const mongoose = require("mongoose");

function connectDB() {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("User service database connected");
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = connectDB;