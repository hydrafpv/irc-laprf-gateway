// Replace this with your Event Timer IP Address (if present), comment out to use the USB Puck
// const EventTimerIP = "192.168.1.9";

// Set the port this gateway will listen on (5403 is suggested)
const gatewayPort = 5403

// Imports
const fs = require('fs');
const util = require('util');
const SerialPort = require('serialport')
const Net = require('net');
const USBDetect = require('usb-detection');
const mdns = require('mdns');

var log_file = fs.createWriteStream('/var/log/laptimergw/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

// Advertise this service over mDNS (Bonjour)
// Comment out if you do not want to do this (Hydra software uses this to automatically connect)
const advterise = mdns.createAdvertisement(mdns.tcp('immersionrc'), gatewayPort);
advterise.start();

// Networked Event Timer
let eventTimer = null;

// Local USB LapRF Personal Puck
let puck = null;

// Keep track of connections to the Puck / Event Timer
const sockets = {};

function connectEventTimer() {
    if (typeof EventTimerIP != 'undefined' && EventTimerIP.length > 0 && eventTimer == null) {
        console.log('Attempting to connect to Event Timer: ' + EventTimerIP);
        const timerOptions = {
            host: EventTimerIP,
            port: 5403
        }
        eventTimer = Net.createConnection(timerOptions, () => {
            console.log('Event Timer Connected');
        });
        eventTimer.setTimeout(15000);
        eventTimer.on('data', function (data) {
            console.log('Event Timer Data...');
            // Forward all data (Buffer) to each client socket
            for (var address in sockets) {
                console.log('      ... Forwarding to ' + address);
                let socket = sockets[address];
                socket.write(data);
            }
        });
        eventTimer.on('error', (err) => {
            // Errors Happen. Open an Issue on Github!
            console.log('Event Timer Error');
            console.error(JSON.stringify(err));
            // eventTimer = null;
            // connectEventTimer();
        });
        eventTimer.on('timeout', function () {
            console.log('Event Timer Timed out');
            eventTimer = null;
            connectEventTimer();
        });
        eventTimer.on('end', function () {
            console.log('Event Timer Disconnected');
            eventTimer = null;
            connectEventTimer();
        });
    }
}

function connectPuck() {
    function openPuck(location) {
        console.log('Puck Connected');
        puck = new SerialPort(location, {
            baudRate: 115200    // The Puck operates at this speed. Do Not Change.
        });
        puck.on('data', function (data) {
            console.log('Puck Data...');
            // Forward all data (Buffer) to each client socket
            for (var address in sockets) {
                console.log('      ... Forwarding to ' + address);
                let socket = sockets[address];
                socket.write(data);
            }
        });
    }

    // Look for the Puck Serial Device
    function findSerialDevice() {
        SerialPort.list().then(
            ports => {
                if (puck == null) {
                    ports.forEach(port => {
                        // Only interested in the ImmersionRC Vendor and LapRF Puck Product
                        if (port.vendorId === '04d8' & port.productId === '000a') {
                            openPuck(port.path);
                        }
                    });
                }
                if (puck == null) {
                    // If the puck is still null, try again in 5 seconds
                    setTimeout(findSerialDevice, 5000);
                }
            },
            err => {
                console.error(err);
                // Some error occurred ... go ahead and try again in 5 seconds
                setTimeout(findSerialDevice, 5000);
            }
        )
    }

    // Do an initial search for the USB Puck at launch
    findSerialDevice();

    // USB Detector for the Puck (Puck is not plugged in after launch of the Gateway)
    USBDetect.startMonitoring();
    // 1240:10 is the Vendor ID / Product ID of the ImmersionRC Puck
    USBDetect.on('add:1240:10', function(device) {
        // Need to delay a second as it takes a bit for the OS to identify the USB device's Serial Properties
        setTimeout(findSerialDevice, 1000);
    });
    USBDetect.on('remove:1240:10', function(device) {
        console.log("Puck Disconnected")
        // TODO / BUG: If you plug a second Puck in and then remove it, it nulls out the first puck
        // Work around: Don't do that.
        // Issue: the device (USB) doesn't provide information about the Serial port directly.
        // ... would need to do an additional scan of the serial ports and see if the puck was gone.
        // So just don't do that.
        puck = null;
    });
}

// Event Timer or USB Puck?
if (typeof EventTimerIP != 'undefined' && EventTimerIP.length > 0) {
    connectEventTimer();
} else {
    connectPuck();
}

// Main server for client connections to the Gateway.
const server = Net.createServer(client => {
    // Client connected, store it where the Puck / Event Timer can get at it
    sockets[client.remoteAddress] = client;
    client.on('data', function (data) {
        console.log('Socket Data...');
        if (eventTimer) {
            console.log('      ... Forwarding to Event Timer');
            eventTimer.write(data);
        } else if (puck) {
            console.log('      ... Forwarding to Puck');
            puck.write(data);
        }
    });
    client.on('error', (err) => {
        // Errors Happen. Open an Issue on Github!
        console.error(JSON.stringify(err));
    });
    client.on('end', function () {
        // Remove this Client from the socket object
        delete sockets[client.remoteAddress];
    });
});

server.on('error', (err) => {
    // Errors Happen. Open an Issue on Github!
    console.error('TCP server: ' + JSON.stringify(err));
});

server.on('close', () => {
    console.log('TCP server: Socket Closed.');
});
// Start listening on the ImmersionRC Network Port (gatewayPort)

server.listen(gatewayPort, () => {
    console.log('TCP server: ' + JSON.stringify(server.address()));
});

// Overload default log function to output to file and stdout
console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};
