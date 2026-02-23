const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  publicKey: String
});

module.exports = mongoose.model("User", userSchema);