const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.put("/settings", userController.updateSettings);

router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    user: {
      username: req.user.username,
      fullName: req.user.fullName,
      city: req.user.city,
      state: req.user.state,
    },
  });
});

module.exports = router;
