const captainModel = require("../models/captain.model");
const blacklisttokenModel = require("../models/blacklisttoken.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { subscribeToQueue } = require("../service/rabbit");

const pendingRequests = [];

module.exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const captain = await captainModel.findOne({ email });

    if (captain) {
      return res.status(400).json({ message: "Captain already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCaptain = new captainModel({
      name,
      email,
      password: hashedPassword,
    });

    await newCaptain.save();

    const token = jwt.sign({ id: newCaptain._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const captainResponse = { ...newCaptain.toObject() };
    delete captainResponse.password;

    res.cookie("token", token);

    res.send({ token, newCaptain: captainResponse });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const captain = await captainModel.findOne({ email }).select("+password");
    if (!captain) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, captain.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: captain._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const captainResponse = { ...captain.toObject() };
    delete captainResponse.password;

    res.cookie("token", token);

    res.send({ token, captain: captainResponse });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    await blacklisttokenModel.create({ token });
    res.clearCookie("token");
    res.send({ message: "Captain logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.profile = async (req, res) => {
  try {
    res.send(req.captain);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.toggleAvailability = async (req, res) => {
  try {
    const captain = await captainModel.findById(req.captain._id);
    captain.isAvailable = !captain.isAvailable;
    await captain.save();
    res.send(captain);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.waitForNewRide = async (req, res) => {
  req.setTimeout(120000, () => {
    res.status(204).end();
  });

  pendingRequests.push(res);
};

subscribeToQueue("new-ride", (data) => {
  const rideData = JSON.parse(data);

  pendingRequests.forEach((res) => {
    res.send({ data: rideData });
  });

  pendingRequests.length = 0;
});
