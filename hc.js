const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
    console.log('Socket open');
    // Subscribe to a channel
    const subscriptionMessage = JSON.stringify({ type: 'subscribe', channel: `${process.env.HC_ID}` });
    ws.send(subscriptionMessage);
});

ws.on('message', (message) => {
    let data = JSON.parse(message);
    console.log('Received message:', data);

    if (data.type === 'control') {
        data.type = 'status';
        ws.send(JSON.stringify(data));
    } else if (data.type === 'config') {
        ws.send(message);
    }
});

ws.on('close', () => {
    console.log('Connection closed');
});