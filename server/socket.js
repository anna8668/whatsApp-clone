const Message = require("./models/Message");
const User = require("./models/User");

module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log("🔌 User connected:", socket.id);

    // Register user and store public key
    socket.on("register_user", async (data) => {
      try {
        console.log("Registering user:", data.username);

        await User.findOneAndUpdate(
          { username: data.username },
          { publicKey: data.publicKey },
          { upsert: true, new: true }
        );

      } catch (err) {
        console.error("Register error:", err);
      }
    });

    // Send receiver public key to sender
    socket.on("get_public_key", async (username, callback) => {
      try {
        const user = await User.findOne({ username });

        if (!user) {
          console.log("User not found:", username);
          return callback(null);
        }

        console.log("Sending public key for:", username);
        callback(user.publicKey);

      } catch (err) {
        console.error("Error fetching public key:", err);
        callback(null);
      }
    });

    // Receive encrypted message
    socket.on("send_message", async (data) => {
      try {
        console.log("📩 Encrypted message received from:", data.sender);

        const newMessage = new Message({
          sender: data.sender,
          receiver: data.receiver,
          cipher: data.cipher,
          iv: data.iv,
          encryptedAESKey: data.encryptedAESKey,
          timestamp: new Date()
        });

        await newMessage.save();

        // Send message to all clients
        io.emit("receive_message", data);

      } catch (err) {
        console.error("Message save error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });

  });

};