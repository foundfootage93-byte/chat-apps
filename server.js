const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
cors: {
origin: '*'
}
});


const PORT = process.env.PORT || 5000;


// Pastikan folder uploads ada
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });


// Multer setup
const storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, UPLOAD_DIR);
},
filename: function (req, file, cb) {
const ext = path.extname(file.originalname);
cb(null, uuidv4() + ext);
}
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // max 5MB


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/', express.static(path.join(__dirname, 'public')));


// Simple POST endpoint for image upload (called from client fetch)
app.post('/upload-image', upload.single('image'), (req, res) => {
if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
const fileUrl = `/uploads/${req.file.filename}`; // served by express.static
return res.json({ url: fileUrl });
});


// Socket.io realtime
io.on('connection', socket => {
console.log('client connected:', socket.id);


// user set name
socket.on('set-name', name => {
socket.data.name = name;
});


socket.on('chat-message', msg => {
// msg: { from, text, time }
io.emit('chat-message', msg);
});


socket.on('chat-image', imgMsg => {
// imgMsg: { from, url, time }
io.emit('chat-image', imgMsg);
});


socket.on('disconnect', () => {
console.log('client disconnected:', socket.id);
});
});


server.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
console.log(`Open http://localhost:${PORT} in browser`);
});