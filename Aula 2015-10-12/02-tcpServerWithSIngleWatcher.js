'use strict'

// Preparing Phase
const net = require('net');
const fs = require('fs');

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

fs.watch(filename, OnFileChanged);
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

    clients[key] = c;


    c.on('end', function() {
        delete clients[key];

        console.log('client disconnected wit key ' + key + "\n");
    });
}

////////////// Callback functions ///////////
function OnFileChanged(event, file) {
    var objResult = {
        filename: filename,
        kind: 'changed',
        timestamp: Date.now()
    };
    var msg = JSON.stringify(objResult);
    console.log(msg);
    console.log("Event " + event + " file: " + file);

    Object.keys(clients).forEach(SendMessageToClient);

    function SendMessageToClient(k) {
        clients[k].write(msg);
        console.log("Notifying client with id " + k);
    }
}

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



