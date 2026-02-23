const socket = io("https://whatsapp-clone-w1bu.onrender.com");
socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

// Register user after ensuring username exists
async function registerUser() {
  const username = localStorage.getItem("username");
  if (!username) return;

  await generateRSAKeys();
  const publicKey = await exportPublicKey();

  socket.emit("register_user", {
    username,
    publicKey
  });

  console.log("RSA keys generated & public key sent");
}

registerUser();

// Receive encrypted message
socket.on("receive_message", async (data) => {

  const currentUser = localStorage.getItem("username");

  // Only decrypt if message is for this user
  if (data.receiver !== currentUser) return;

  try {
    const aesKey = await decryptAESKey(data.encryptedAESKey);
    const message = await decryptMessage(data.cipher, data.iv, aesKey);

    console.log("Decrypted:", message);

    // Display in chat UI
    displayMessage(data.sender, message);

  } catch (err) {
    console.error("Decryption failed:", err);
  }

});