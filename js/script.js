const express = require('express');
const app = express();

app.use(express.static('socket'));

app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/icons/favicon.ico', (req, res, next) => {
    res.sendFile(__dirname + '/public/icons/favicon.ico');
});

app.get('/icons/fighter-blue.png', (req, res, next) => {
    res.sendFile(__dirname + '/public/icons/fighter-blue.png');
});

const httpServer = app.listen(8000, () => console.log('Server listen to html calls at port 8000\n'));

const io = require("socket.io")(httpServer, {
    cors: { origin: "*" }
});


// UDP
const UDP = require('dgram')

const client = UDP.createSocket('udp4')

const UDPport = 12345

const hostname = 'localhost'
let objToHTML = {}
let dcsData = {}

client.on('listening', () => console.log(time(), 'UDP listening to UDP server:', client.address()))
// client.on('message', (_, info) => console.log(time(), 'UDP message from:', info))
client.on('message', msg => serverMsg(msg))
client.on('error', err => console.log(time(), 'UDP connection error:\n', err.message))

function serverMsg(msg) {

    try {
        let msgToStr = msg.toString()

        // reset JSON data if socket gets this string
        if (msgToStr == 'objects_end') {
            console.log('got objects_end');
            objToHTML = {}
            return 0;
        }
        let msgToJSON = tableToJson(msgToStr)
        dcsData = JSON.parse(msgToJSON);

        for (const [key, value] of Object.entries(dcsData)) {
            objToHTML[key] = value
        }
        console.log('Object length:', Object.keys(objToHTML).length);
        io.sockets.emit('chat', objToHTML); // send UDP result to html

    } catch (err) {
        console.log(time(), 'the UDP message:`', msg.toString(), '` has an ERROR:', err.message)
        dcsData = {};
    }
}

function tableToJson(data) {
    data = data.toString();
    data = data.replace(/=/g, '":');  // use regular expression to replace all '=' characters
    data = data.replace(/{/g, '{"');  // use regular expression to replace all '{' characters
    data = data.replace(/,/g, ',"');   // use regular expression to replace all ',' characters
    return data;
}

function time() {
    let d = new Date();
    let h = addZero(d.getUTCHours());
    let m = addZero(d.getUTCMinutes());
    let s = addZero(d.getUTCSeconds());
    return h + ":" + m + ":" + s;
}

function addZero(i) {
    if (i < 10) { i = "0" + i }
    return i;
}


// // clear objToHTML event x sec
// setInterval(function () {
//     console.log('clear objToHTML');
//     objToHTML = {}
// }, 10000)


client.bind(UDPport)