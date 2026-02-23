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

  // ✅ RECEIVE & DECRYPT MESSAGE
  socket.on("receive_message", async (data) => {

    const currentUser = localStorage.getItem("username");

    // Only receiver should decrypt
    if (data.receiver !== currentUser) return;

    try {
      // 🔐 Get private key
      const privateKeyBase64 = localStorage.getItem("privateKey");
      const privateKeyBuffer = Uint8Array.from(atob(privateKeyBase64), c => c.charCodeAt(0));

      const privateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        {
          name: "RSA-OAEP",
          hash: "SHA-256"
        },
        true,
        ["decrypt"]
      );

      // 🔐 Decrypt AES key
      const encryptedAESKeyBytes = Uint8Array.from(atob(data.encryptedAESKey), c => c.charCodeAt(0));

      const aesKeyRaw = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encryptedAESKeyBytes
      );

      const aesKey = await window.crypto.subtle.importKey(
        "raw",
        aesKeyRaw,
        { name: "AES-GCM" },
        true,
        ["decrypt"]
      );

      // 🔐 Decrypt actual message
      const decryptedMessage = await decryptMessage(data.cipher, data.iv, aesKey);

      displayMessage(data.sender, decryptedMessage);

    } catch (err) {
      console.error("Decryption failed:", err);
    }

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