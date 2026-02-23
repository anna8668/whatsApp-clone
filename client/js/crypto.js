// 🔹 Import receiver public key
async function importPublicKey(base64Key) {
  const binary = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "spki",
    binary,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
}

// 🔹 Import private key from localStorage
async function importPrivateKey() {
  const privateKeyBase64 = localStorage.getItem("privateKey");
  const binary = Uint8Array.from(atob(privateKeyBase64), c => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    binary,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
}

// 🔹 Generate AES key
async function generateAESKey() {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// 🔹 Encrypt message using AES
async function encryptMessage(message, aesKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(message);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoded
  );

  return {
    cipher: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

// 🔹 Decrypt message using AES
async function decryptMessage(cipherBase64, ivBase64, aesKey) {
  const cipherBytes = Uint8Array.from(atob(cipherBase64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    cipherBytes
  );

  return new TextDecoder().decode(decrypted);
}

// 🔹 Encrypt AES key using RSA
async function encryptAESKey(aesKey, receiverPublicKey) {
  const rawKey = await crypto.subtle.exportKey("raw", aesKey);

  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    receiverPublicKey,
    rawKey
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// 🔹 Decrypt AES key using stored private key
async function decryptAESKey(encryptedKeyBase64) {
  const privateKey = await importPrivateKey();

  const binary = Uint8Array.from(atob(encryptedKeyBase64), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    binary
  );

  return crypto.subtle.importKey(
    "raw",
    decrypted,
    { name: "AES-GCM" },
    true,
    ["decrypt"]
  );
}