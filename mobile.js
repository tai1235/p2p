const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
    console.log('Socket open');
    // Subscribe to a channel
    const subscriptionMessage = JSON.stringify({ type: 'subscribe', channel: 'mobile' });
    ws.send(subscriptionMessage);
});

ws.on('message', (message) => {
    console.log('Received message:', message.toString());
});

ws.on('close', () => {
    console.log('Connection closed');
});