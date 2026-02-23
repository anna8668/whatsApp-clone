const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

require("dotenv").config();

// ✅ Correct MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

app.use("/messages", require("./routes/messages"));

require("./socket")(io);

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

server.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});