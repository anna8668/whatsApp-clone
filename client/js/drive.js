let accessToken = null;

function getAccessToken(callback) {
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: (response) => {
      accessToken = response.access_token;
      callback();
    },
  });

  tokenClient.requestAccessToken();
}

async function backupToDrive() {
  const username = localStorage.getItem("username");

  try {
    const response = await fetch("https://whatsapp-clone-w1bu.onrender.com/messages/" + username);
    const messages = await response.json();

    console.log("Encrypted messages fetched:", messages);

    const blob = new Blob([JSON.stringify(messages, null, 2)], {
      type: "application/json"
    });

    const file = new File([blob], "encrypted_chat_backup.json", {
      type: "application/json"
    });

    getAccessToken(() => uploadFile(file));

  } catch (err) {
    console.error("Backup error:", err);
  }
}

function uploadFile(file) {
  const metadata = {
    name: file.name,
    mimeType: file.type,
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: new Headers({
      Authorization: "Bearer " + accessToken
    }),
    body: form,
  })
  .then(res => res.json())
  .then(data => {
    console.log("Backup uploaded:", data);
    alert("Backup uploaded successfully!");
  })
  .catch(err => console.error("Upload error:", err));
}