const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const channels = {};
const messageQueue = {};

// WebSocket handling
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'subscribe') {
                const channel = data.channel;
                if (!channels[channel]) {
                    channels[channel] = [];
                }
                channels[channel] = ws;
                console.log('channel open', channel);
            }

            if (data.type === 'config') {
                console.log('Handle config', data.id);
                messageQueue[data.id].res.send(message);
                delete messageQueue[data.id];
            }
            
            if (data.type === 'status') {
                if (channels['mobile']) channels['mobile'].send(message);
            }
        } catch (error) {
            console.error('Invalid message format:', message);
        }
    });
});

app.use(express.json());

// HTTP route for directly processing requests
app.get('/direct', (req, res) => {
    res.send(req.body);
});

// Relay HTTP requests to another server
app.all('/relay/*', async (req, res) => {
    const channel = req.path.split(/[/]+/).pop();
    console.log('channel', channel);
    try {
        console.log(req.body);
        channels[channel].send(JSON.stringify(req.body));
        if (req.body.type === 'control') {
            res.send();
        } else {
            console.log('Push message', req.body.id);
            messageQueue[req.body.id] = {req, res};
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to relay request' });
    }
});

// Start the server
const port = 3000;
server.listen(port, () => {
    console.log(`Relay server is listening on port ${port}`);
});
