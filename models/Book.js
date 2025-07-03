const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  status: { type: String, default: "available" },
});

module.exports = mongoose.model("Book", BookSchema);
