const socket = io();

let username = "Anon";

// Set nama pengguna
document.getElementById("setNameBtn").addEventListener("click", () => {
  const input = document.getElementById("usernameInput");
  if (input.value.trim() === "") return alert("Masukkan nama terlebih dahulu!");
  username = input.value.trim();
  socket.emit("setName", username);
  alert(`Nama diatur menjadi: ${username}`);
});

// Kirim pesan
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const messages = document.getElementById("messages");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value.trim() === "") return;
  socket.emit("chatMessage", input.value);
  input.value = "";
});

// Terima pesan dari server
socket.on("chatMessage", (data) => {
  const li = document.createElement("li");
  li.innerHTML = `<span>${data.name}:</span> ${data.msg}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
