const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  cipher: String,
  iv: String,
  encryptedAESKey: String,
  timestamp: Date
});

module.exports = mongoose.model("Message", messageSchema);