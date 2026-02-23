function login() {
  const username = document.getElementById("username").value;

  if (!username) return alert("Enter username");

  localStorage.setItem("username", username);
  window.location.href = "index.html";
}