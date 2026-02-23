const socket = io("https://whatsapp-clone-w1bu.onrender.com");

async function login() {
  const username = document.getElementById("username").value.trim();

  if (!username) return alert("Enter username");

  // 🔐 Generate RSA key pair
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Export keys
  const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  // Convert to Base64
  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
  const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));

  // Save private key locally
  localStorage.setItem("username", username);
  localStorage.setItem("privateKey", privateKeyBase64);

  // 🔥 Send public key to server
  socket.emit("register_user", {
    username,
    publicKey: publicKeyBase64
  });

  window.location.href = "index.html";
}