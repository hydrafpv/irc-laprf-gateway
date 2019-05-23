# ImmersionRC LapRF Gateway

This Node.js app sits in front of an 8-Way Event Timer or a LapRF Personal Timer ("Puck") and allows multiple connections to the device. It also converts the Puck, when connected to the host over USB, to an Ethernet connection for improved reliability and throughput.

This application can be run on any device with Node.js installed, including:
- A Raspberry Pi, including the Zero W (ideal for turning the Puck into a WiFi device)
- Your current laptop

# Raspberry Pi Setup

I recommend the Raspbian Stretch Lite OS (smallest image, no desktop, terminal only).

You will need to install Node.js manually (not using apt-get).
- From the terminal, execute `uname -m`
- Visit https://nodejs.org/en/download/
- Download the appropriate LTS ARM version (ARM version from the output from uname)
- `wget https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-armv6l.tar.xz`
- Unzip the tar: `tar -xf node-v10.15.3-linux-armv7l.tar.xz`
- Copy the binaries: `sudo cp -R node-v10.15.3-linux-armv7l/* /usr/local/`


# Installation

Clone this repository:

Install dependencies: `npm install`

Raspberry Pi Notes:
- sudo apt-get install libusb-1.0-0-dev
- sudo apt-get install libudev-dev

If you are using the Event Timer, edit the index.js file and insert the static IP address of the timer.
If you are using the Puck, set the Event Timer IP address to "".

# Running

Execute `node index.js` in the main folder.
Connect to the Gateway instead of the devices directly.
