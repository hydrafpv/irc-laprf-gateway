# ImmersionRC LapRF Gateway

This Node.js app sits in front of an 8-Way Event Timer or a LapRF Personal Timer ("Puck") and allows multiple connections to the device. It also converts the Puck, when connected to the host over USB, to an Ethernet connection for improved reliability and throughput.

This application can be run on any device with Node.js installed, including:
- A Raspberry Pi, including the Zero W (ideal for turning the Puck into a WiFi device)
- Your current laptop

# Raspberry Pi Setup

I recommend the Raspbian Stretch Lite OS (smallest image, no desktop, terminal only).
- Download the Stretch Lite image from https://www.raspberrypi.org/downloads/raspbian/
- Flash using balenaEtcher to a SD card
- Mount the SD card and add an empty file named "ssh" to the root directory (this will enable SSH on boot)
- Also add a file called "wpa_supplicant.conf" with the following contents to have it automatically connect to your WiFi:

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=«your_ISO-3166-1_two-letter_country_code»

network={
    ssid="«Your SSID»"
    psk="«SSID Password»"
}
```

You will need to install Node.js manually (not using apt-get). The version is ARM processor dependent.
- From the terminal, execute `uname -m` You will get an ARM processor version value, such as "armv71" for ARM Version 7.1.
- If you are using the Rasberian Stretch Lite OS as suggested above, you will need to visit https://nodejs.org/en/download/ on a separate device to determine which filename to install. On a desktop version of OS, visit and download using the Pi browser.
- If you are using a Pi Zero W, the ARM version is 6.1, which is not supported above LTS 10 (https://nodejs.org/dist/latest-v10.x/).
- Download the appropriate LTS ARM version: `wget https://nodejs.org/dist/v10.19.0/node-v10.19.0-linux-[your ARM version].tar.xz`
- Unzip the tar: `tar -xf node-v10.19.0-linux-[your ARM version].tar.xz`
- Copy the binaries: `sudo cp -R node-v10.19.0-linux-[your ARM version]/* /usr/local/`

Raspberry Pi Notes:
  Install these libraries to use with the gateway, even if you are not using the Puck.
  The code auto-detects the device.
- `sudo apt-get install git`
- `sudo apt-get install libusb-1.0-0-dev`
- `sudo apt-get install libudev-dev`
- `sudo apt-get install libavahi-compat-libdnssd-dev`

  Create the log file directory so you can see the output if the gateway is running as a daemon
- `sudo mkdir /var/log/laptimergw`

  Setting the Hostname of the Pi will allow you to connect to it without needing the IP address as well.
 - `sudo nano /etc/hostname` and set it to something unique

# Windows Setup

When installing Node.js for Windows, ensure that you install the "Additional Tools" for compiling NPM packages.
You will also need to install Apple's "[Bonjour SDK for Windows](https://developer.apple.com/bonjour/)" (Apple ID required). (More info here: https://github.com/agnat/node_mdns)

# Installation and Setup

- Clone this repository: `git clone https://github.com/hydrafpv/irc-laprf-gateway`
- Install dependencies within the directory created by the repository: `npm install`
- If you are using the Event Timer, edit the index.js file and insert the static IP address shown on the screen of the timer. If you are using the Puck, set the Event Timer IP address to "".

# Connections

### Puck
- Raspberry Pi: Use a standard USB micro cable to connect between the Puck and the Pi via one of the 4 USB plugs.
- Raspberry Zero: You will need an "OTG USB Micro male to Female USB-2.0 Type-A" cable or adapter (like https://www.amazon.com/Rankie-Female-Adapter-Convertor-3-Pack/dp/B00YOX4JU6). Connect the standard micro USB end to the puck. The OTG adapter must be on the Zero end of the connection.
-
### Event Tracker/LapRF 8-way Timer
- Ethernet: Connect the Pi (or whatever is running the Gateway) to the same LAN as the Event Timer. Enter the IP address of the Timer in the `index.js` file. Enter the IP address of the Gateway instead of the Timer in your timing software.
- USB + WiFi: Open the Event Timer (void that warranty!) and connect the Timer to a Pi Zero using a USB OTG cable. Enter the IP address of the Pi Zero W in your timing software.

# Running

Execute `node index.js` in the main folder.
Connect to the WiFi Gateway instead of the device directly.


# Run on startup
`sudo nano /etc/systemd/system/irc-laprf-gateway.service`

Contents:
```
[Unit]
Description=IRC LapRF Gateway
After=multi-user.target

[Service]
Type=idle
WorkingDirectory=/home/pi/irc-laprf-gateway
ExecStart=/usr/local/bin/node index.js

[Install]
WantedBy=multi-user.target
```

Set the permissions:
- `sudo chmod 644 /etc/systemd/system/irc-laprf-gateway.service`
- `sudo systemctl daemon-reload`
- `sudo systemctl enable irc-laprf-gateway.service`

# mDNS (Bonjour)
The gateway will broadcast itself over mDNS which makes discovery much simpler for tools that want to use it. No more punching in IP addresses!
The advertised service is `_immersionrc._tcp.`.

# ToDos
- Expose a BLE Service (on supported devices) to change the WiFi SSID / PASS
- Control port to adjust the IP address of the Timer over the network
