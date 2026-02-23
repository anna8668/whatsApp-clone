const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

router.get("/:username", async (req, res) => {
  try {
    const username = req.params.username;

    const messages = await Message.find({
      $or: [
        { sender: username },
        { receiver: username }
      ]
    });

    res.json(messages);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;