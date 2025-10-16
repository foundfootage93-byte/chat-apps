const socket = io();


// Elements
const nameInput = document.getElementById('nameInput');
const setNameBtn = document.getElementById('setNameBtn');
const messagesList = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const imageInput = document.getElementById('imageInput');


let myName = 'Anon';


setNameBtn.addEventListener('click', () => {
const val = nameInput.value.trim();
if (!val) return alert('Masukkan nama.');
myName = val;
socket.emit('set-name', myName);
nameInput.blur();
});


function appendTextMessage({ from, text, time }){
const li = document.createElement('li');
li.classList.add('message');
if (from === myName) li.classList.add('me');
li.innerHTML = `<div class="meta">${escapeHtml(from)} • ${escapeHtml(time)}</div><div class="body">${escapeHtml(text)}</div>`;
messagesList.appendChild(li);
messagesList.scrollTop = messagesList.scrollHeight;
}


function appendImageMessage({ from, url, time }){
const li = document.createElement('li');
li.classList.add('message');
if (from === myName) li.classList.add('me');
li.innerHTML = `<div class="meta">${escapeHtml(from)} • ${escapeHtml(time)}</div><div class="body"><img src="${escapeHtml(url)}" alt="image"/></div>`;
messagesList.appendChild(li);
messagesList.scrollTop = messagesList.scrollHeight;
}


// Receive messages
socket.on('chat-message', msg => {
appendTextMessage(msg);
});


socket.on('chat-image', imgMsg => {
appendImageMessage(imgMsg);
});


// Send text message
messageForm.addEventListener('submit', async (e) => {
e.preventDefault();
const text = messageInput.value.trim();
if (!text) return;
const now = new Date().toLocaleTimeString();
const payload = { from: myName, text, time: now };
socket.emit('chat-message', payload);
messageInput.value = '';
});


// Send image via upload endpoint then emit event with image URL
imageInput.addEventListener('change', async () => {
const file = imageInput.files[0];
if (!file) return;
const form = new FormData();
form.append('image', file);


try{
const res = await fetch('/upload-image', { method: 'POST', body: form });
const data = await res.json();
if (data.url){
const now = new Date().toLocaleTimeString();
const imgMsg = { from: myName, url: data.url, time: now };
socket.emit('chat-image', imgMsg);
} else {
alert('Upload gagal');
}
} catch(err){
console.error(err);
alert('Gagal upload');
} finally {
imageInput.value = '';
}
});


// small helper
function escapeHtml(unsafe) {
return unsafe
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/\"/g, "&quot;")
.replace(/\'/g, "&#039;");
}