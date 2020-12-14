# iotprovision

## Overview
iotprovision is a utility for provisioning Microchip IoT kits for use with various cloud providers.

## Supported kits
- AVR-IOT WG
- PIC-IOT WG
- AVR-IOT WA
- PIC-IOT WA

## Supported cloud services providers
- Google Cloud Platform
- Amazon Web Services

## Installation
This distribution contains command-line executables for Windows®, Mac OS®, and Linux®, bundled with all firmware needed to complete the provisioning.
Extract and store the command-line utility corresponding to your operating system.

## Command-line Usage

### Default operation
The default operation of this utility is to provision a connected kit for use with AWS and the Microchip sandbox account.
```sh
iotprovision
```

### Selecting the cloud provider
To reprovision your IoT kit for a specific cloud provider, use the -c switch.  For example to provision for use with Google Cloud Platform:
```sh
iotprovision -c google
```
and to provision for use with Amazon Web Services:
```sh
iotprovision -c aws
```
## What it does
The iotprovision utility performs many operations using the IoT kit hardware to prepare it for use with the selected cloud provider. This is an overview of the steps involved:

### Kit Provisioning Overview

1. Kit detection.  Only IoT kits listed in the "supported kits" section above will be able to be used with this utility.

2. On-board debugger firmware upgrade.  The debugger will automatically be upgraded before proceeding with provisioning.  The firmware file is bundled inside the executable.

3. Program provisioning firmware into target MCU on IoT board.  This firmware responds to a set of instructions on its UART (which is connected to the virtual serial port) and interacts with both the ECC608 secure element and the WiFi module on the kit.

4. Kit provisioning according to variant - see the following section for details.

5. Configure IoT links in mass storage device.  The debugger on the IoT kit implements a mass storage device which contains links to the IoT demo front-end.  During reprovisioning this link is updated.

6. Application programming.  After the provisioning is complete, the provisioning firmware on the target MCU is replaced with the "demo" application for connecting to the cloud.

7. WiFi setup. The WiFi authentication scheme, ssid and password are sent to the application firmware which configures the WiFi module to connect to the network.

## Provisioning variant details
### AWS with Microchip sandbox account
This will provision the kit for the Microchip sandbox account on AWS.  This account is for demonstration purposes.  
- Erase TLS certificate section on WiFi module
- Retrieve device certificate from secure element and generate "thing name" for AWS
- Send CA signer certificate, device certificate, and thing name,to the kit for storage in WiFi module memory
- Lock slots 10, 11, 12 on the ECC608 secure element

### AWS with custom user account using JITR
These steps (root and signer certificate generation) are done only once, prior to actual kit provisioning.  The results are saved in files for future use:
- Create root CA private key
- Create self-signed root CA
- Create signer CA private key
- Create a signer CSR
- Sign the CSR with root CA
- Register signer with AWS

AWS provisioning for user account:
- Retrieve a device certificate CSR from kit
- Generate device certificate from CSR
- Send CA signer certificate, device certificate, thing name, and AWS endpoint to the kit for storage in WiFi module memory.
- Lock slots 10, 11, 12 on the ECC608 secure element

### Google Cloud Platform with Microchip sandbox account
The ECC608 secure element on the kit is already pre-configured and pre-registered with Google Cloud Platform, so no explicit reprovisioning is needed.
However - step 5 above is necessary in order to connect to the Google demo front-end.

### Google Cloud Platform with custom user account
For details about moving from the Microchip sandbox account to your own Google account, follow the "click-me" link on your kit's mass storage device and then look for the "graduate" button.

## Microchip sandbox account
Microchip has setup 'sandbox' accounts with supported cloud service providers to allow IoT boards to send data to these cloud providers without setting up a private account in advance.  These accounts are intended for development purposes only, and there is no permanent storage or collection of data sent to them.  For a full-featured cloud experience, users must migrate their boards from the demonstration environment over to a private account.  This process is referred to as 'graduation'.