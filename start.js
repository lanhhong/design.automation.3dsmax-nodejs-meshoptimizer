const express = require('express');
const app = express();
const socketio = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const config = require('./config');
if (config.credentials.client_id == null || config.credentials.client_secret == null) {
    console.error('Missing FORGE_CLIENT_ID or FORGE_CLIENT_SECRET env. variables.');
    return;
}
const server = app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); });

// Set up connection between server and client (server-side)
const io = socketio.listen(server);
app.io = io; // To use io in routers

app.use(express.static(path.join(__dirname, 'public')));
app.use(require('./routes/DesignAutomation'));

