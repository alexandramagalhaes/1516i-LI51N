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

/////////////// Callback Phase /////////////////////

/*
 * Callback called when client connects
 */
function OnClientConnected(c) { //'connection' listener
    console.log('client connected\n');
    c.write("Hello There. I'll notify you when the file " + filename + " changes\r\n");

    fs.watch(filename, OnFileChanged);

    c.on('end', function() {
        console.log('client disconnected');
    });

    ////////////// Callback functions ///////////
    function OnFileChanged(event, file) {
        var msg = "File " + filename + " just changed!\r\n";
        console.log(msg);
        console.log("Event " + event + " file: " + file);
        c.write(msg);
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




