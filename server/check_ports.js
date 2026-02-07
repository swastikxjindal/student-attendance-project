const net = require('net');

const client = new net.Socket();
client.setTimeout(2000);

client.connect(3306, '127.0.0.1', function () {
    console.log('Connected to 3306');
    client.destroy();
});

client.on('error', function (err) {
    console.log('Error 3306:', err.message);
});

client.on('timeout', function () {
    console.log('Timeout 3306');
    client.destroy();
});

const client2 = new net.Socket();
client2.setTimeout(2000);
client2.connect(3307, '127.0.0.1', function () {
    console.log('Connected to 3307');
    client2.destroy();
});

client2.on('error', function (err) {
    console.log('Error 3307:', err.message);
});

client2.on('timeout', function () {
    console.log('Timeout 3307');
    client2.destroy();
});
