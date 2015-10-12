'use strict'

// Preparing Phase
const net = require('net');
const watcher = require('./watcher');
watcher.foo();

const PORT =  3000;

const filename = process.argv[2];

if (!filename) {
    throw Error("A file to watch must be specified!");
}

// Initialization Phase

var server = net.createServer(OnClientConnected);
server.listen(PORT, OnListenComplete);
process.on('SIGINT', OnExit);

/////////////// Callback Phase /////////////////////

/*
 * Callback called when client connects
 */


let clients = {};

let clientKey = 0;


function OnClientConnected(c) { //'connection' listener
    var key = clientKey++;
    console.log('client connected. Assigned key is:' + key + "\n");
    c.write(JSON.stringify({
        filename: filename,
        kind: 'listening',
        timestamp: Date.now()
    }));

    const cb = (m) => c.write(m);
    watcher.on('change', cb);

    clients[key] = c;


    c.on('end', function() {
        watcher.removeListener(cb);

        console.log('client disconnected wit key ' + key + "\n");
    });
}

////////////// Callback functions ///////////

/*
 * Callback called when server is listening
 */
function OnListenComplete(e) { //'listening' listener
    console.log("callback listen");
    if (e) {
        console.log('Error in listen: ' + e.code );
        process.exit(-1);
    }
    console.log('server listening on port ' + PORT);
}

function OnExit(code) {
    console.log('About to exit with code:', code);
}



