// 🔥 Socket connection (backend URL)
const socket = io("https://whatsapp-clone-w1bu.onrender.com");

document.addEventListener("DOMContentLoaded", () => {

  console.log("App JS Loaded");

  const sendBtn = document.getElementById("sendBtn");
  const messageInput = document.getElementById("messageInput");
  const receiverInput = document.getElementById("receiverInput");

  if (!sendBtn) {
    console.error("sendBtn not found");
    return;
  }

  // ✅ RECEIVE MESSAGE LISTENER (VERY IMPORTANT)
  socket.on("receive_message", (data) => {
    console.log("Message received:", data);

    // yaha decrypted message show karna hoga
    // abhi simple display kar rahe hain
    displayMessage(data.sender, data.message || "Encrypted message received");
  });

  sendBtn.addEventListener("click", async () => {

    const message = messageInput.value.trim();
    const receiver = receiverInput.value.trim();
    const sender = localStorage.getItem("username");

    if (!message || !receiver) return;

    socket.emit("get_public_key", receiver, async (publicKey) => {

      if (!publicKey) {
        alert("User not found");
        return;
      }

      try {
        const receiverKey = await importPublicKey(publicKey);
        const aesKey = await generateAESKey();
        const { cipher, iv } = await encryptMessage(message, aesKey);
        const encryptedAESKey = await encryptAESKey(aesKey, receiverKey);

        // ✅ Show own message immediately
        displayMessage(sender, message);
        messageInput.value = "";

        socket.emit("send_message", {
          sender,
          receiver,
          cipher,
          iv,
          encryptedAESKey
        });

      } catch (err) {
        console.error("Encryption error:", err);
      }

    });

  });

});

// ✅ Message display function
function displayMessage(sender, message) {
  const chatBox = document.getElementById("chatBox");

  const msg = document.createElement("div");
  msg.textContent = sender + ": " + message;
  msg.style.margin = "8px 0";

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}