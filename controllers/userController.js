async function updateSettings(req, res) {
  if (!req.isAuthenticated())
    return res.status(401).json({ error: "Not logged in" });

  const { fullName, city, state } = req.body;
  req.user.fullName = fullName;
  req.user.city = city;
  req.user.state = state;
  await req.user.save();

  res.json({ success: true });
}

module.exports = {
  updateSettings,
};
