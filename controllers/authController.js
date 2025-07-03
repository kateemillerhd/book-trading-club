const passport = require("passport");
const User = require("../models/User");

async function register(req, res) {
  try {
    const user = new User({ username: req.body.username });
    await User.register(user, req.body.password);

    req.login(user, function (err) {
      if (err)
        return res.status(500).json({ error: "Login after register failed" });
      res.json({ success: true });
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

const login = passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/",
});

function logout(req, res) {
  req.logout(() => res.redirect("/"));
}

module.exports = {
  register,
  login,
  logout,
};
