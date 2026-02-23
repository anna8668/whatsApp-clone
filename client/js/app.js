document.addEventListener("DOMContentLoaded", () => {

  console.log("App JS Loaded");

  const sendBtn = document.getElementById("sendBtn");
  const messageInput = document.getElementById("messageInput");
  const receiverInput = document.getElementById("receiverInput");

  console.log("Send button element:", sendBtn);

  if (!sendBtn) {
    console.error("sendBtn not found");
    return;
  }

  sendBtn.addEventListener("click", async () => {

    console.log("Send button clicked");

    const message = messageInput.value.trim();
    const receiver = receiverInput.value.trim();
    const sender = localStorage.getItem("username");

    if (!message || !receiver) {
      console.log("Message or receiver missing");
      return;
    }

    socket.emit("get_public_key", receiver, async (publicKey) => {

      console.log("Public key received:", publicKey);

      if (!publicKey) {
        alert("User not found");
        return;
      }

      try {
        // Import receiver's public key
        const receiverKey = await importPublicKey(publicKey);

        // Generate AES session key
        const aesKey = await generateAESKey();

        // Encrypt message using AES
        const { cipher, iv } = await encryptMessage(message, aesKey);

        // Encrypt AES key using receiver's RSA public key
        const encryptedAESKey = await encryptAESKey(aesKey, receiverKey);

        // Show own message immediately
        displayMessage(sender, message);

        // Clear input
        messageInput.value = "";

        // Send encrypted data to server
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
function displayMessage(sender, message) {
  const chatBox = document.getElementById("chatBox");

  const msg = document.createElement("div");
  msg.textContent = sender + ": " + message;

  msg.style.margin = "8px 0";

  chatBox.appendChild(msg);

  // Auto scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;
}