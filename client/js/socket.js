const socket = io("https://whatsapp-clone-w1bu.onrender.com");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

// 🔥 Register user using already stored public key
function registerUser() {
  const username = localStorage.getItem("username");
  const privateKey = localStorage.getItem("privateKey");

  if (!username || !privateKey) return;

  // Public key already saved in DB at login
  // No need to regenerate keys here

  console.log("User already registered at login");
}

registerUser();

// 🔐 Receive encrypted message
socket.on("receive_message", async (data) => {

  const currentUser = localStorage.getItem("username");

  if (data.receiver !== currentUser) return;

  try {
    const aesKey = await decryptAESKey(data.encryptedAESKey);
    const message = await decryptMessage(data.cipher, data.iv, aesKey);

    console.log("Decrypted:", message);

    displayMessage(data.sender, message);

  } catch (err) {
    console.error("Decryption failed:", err);
  }

});