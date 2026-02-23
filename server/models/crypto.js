let rsaKeyPair;

// Generate RSA key pair
async function generateRSAKeys() {
  rsaKeyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export public key
async function exportPublicKey() {
  const exported = await crypto.subtle.exportKey("spki", rsaKeyPair.publicKey);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import receiver public key
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

// Generate AES key
async function generateAESKey() {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt message
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

// Decrypt message
async function decryptMessage(cipher, iv, aesKey) {
  const cipherBytes = Uint8Array.from(atob(cipher), c => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    aesKey,
    cipherBytes
  );

  return new TextDecoder().decode(decrypted);
}

// Encrypt AES key with RSA
async function encryptAESKey(aesKey, receiverPublicKey) {
  const rawKey = await crypto.subtle.exportKey("raw", aesKey);

  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    receiverPublicKey,
    rawKey
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// Decrypt AES key with RSA
async function decryptAESKey(encryptedKey) {
  const binary = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    rsaKeyPair.privateKey,
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