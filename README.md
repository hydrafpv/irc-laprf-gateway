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
- Download the appropriate LTS ARM version: `wget https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-[your ARM version].tar.xz`
- Unzip the tar: `tar -xf node-v10.15.3-linux-[your ARM version].tar.xz`
- Copy the binaries: `sudo cp -R node-v10.15.3-linux-[your ARM version]/* /usr/local/`

Raspberry Pi Notes: 
  Install these libraries to use with the gateway, even if you are not using the Puck. 
  The code auto-detects the device.
- `sudo apt-get install git`
- `sudo apt-get install libusb-1.0-0-dev`
- `sudo apt-get install libudev-dev`

# Installation and Setup

- Clone this repository: `git clone https://github.com/hydrafpv/irc-laprf-gateway`
- Install dependencies within the directory created by the repository: `npm install`
- If you are using the Event Timer, edit the index.js file and insert the static IP address shown on the screen of the timer. If you are using the Puck, set the Event Timer IP address to "".

# Connections

- Puck: Connect the proper USB cable from the Puck one of the USB ports on the Pi.
- Event Tracker/LapRF 8-way Timer: Connect an Ethernet (CAT5) cable between the timer and the Ethernet port on the Pi.

# Running

Execute `node index.js` in the main folder.
Connect to the WiFi Gateway instead of the devices directly.
