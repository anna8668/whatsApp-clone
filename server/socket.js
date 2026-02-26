const Message = require("./models/Message");
const User = require("./models/User");

// ✅ Store online users
const onlineUsers = new Map();

module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log("🔌 User connected:", socket.id);

    // ✅ Mark user online
    socket.on("user_online", (username) => {
      onlineUsers.set(username, socket.id);
      console.log("🟢 Online Users:", onlineUsers);
    });

    // ✅ Register user public key
    socket.on("register_user", async (data) => {
      try {
        await User.findOneAndUpdate(
          { username: data.username },
          { publicKey: data.publicKey },
          { upsert: true, new: true }
        );
        console.log("🔐 Public key stored for:", data.username);
      } catch (err) {
        console.error("Register error:", err);
      }
    });

    // ✅ Get receiver public key
    socket.on("get_public_key", async (username, callback) => {
      try {
        const user = await User.findOne({ username });

        if (!user) {
          console.log("User not found:", username);
          return callback(null);
        }

        callback(user.publicKey);

      } catch (err) {
        console.error("Error fetching public key:", err);
        callback(null);
      }
    });

    // ✅ Send encrypted message
    socket.on("send_message", async (data) => {
      try {
        console.log("📩 Message from:", data.sender, "to:", data.receiver);

        const newMessage = new Message({
          sender: data.sender,
          receiver: data.receiver,
          cipher: data.cipher,
          iv: data.iv,
          encryptedAESKey: data.encryptedAESKey,
          timestamp: new Date()
        });

        await newMessage.save();

        // ✅ Send ONLY to receiver
        const receiverSocket = onlineUsers.get(data.receiver);

        if (receiverSocket) {
          io.to(receiverSocket).emit("receive_message", data);
          console.log("✅ Message delivered to:", data.receiver);
        } else {
          console.log("⚠️ Receiver not online");
        }

      } catch (err) {
        console.error("Message save error:", err);
      }
    });

    // ✅ Remove user when disconnected
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);

      for (let [username, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          onlineUsers.delete(username);
          break;
        }
      }
    });

  });

};