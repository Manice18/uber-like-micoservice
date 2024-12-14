const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/logout", userController.logout);
router.get("/profile", authMiddleware.userAuth, userController.profile); // only logged in user can access this route
router.get(
  "/accepted-ride",
  authMiddleware.userAuth,
  userController.acceptedRide
);

module.exports = router;
