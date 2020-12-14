DESCRIPTION
"""""""""""
This package contains standalone executables for the IOT provisioning
tool, for Windows, MacOS, and Linux in the respective subfolders.

Just copy the relevant executable iotprovision-bin[.exe] to a folder
in your PATH and run it. On Mac/Linux you need to make it executable
first (chmod +x .../iotprovision-bin)

KNOWN ISSUES IN VERSION 1.4.3
"""""""""""""""""""""""""""""
WiFi configuration lost after WINC upgrade
No demo application for Azure available yet, just provisioning

CHANGELOG
"""""""""

1.4.3
"""""
Fix for provisioning on MAC OS with AWS MAR option
Fix so that device certificate is not regenerated if it already exists
Fix in Iot core policy used with the AWS JITR option. This caused the IoT boards to be unable to subscribe to other topics than their shadows


1.4.0
"""""
Provisioning support for AWS MAR
Provisioning for Azure
WINC firmware upgrade

1.1.8.107
"""""""""
AWS Cloud Formation support

1.1.7.dev0
""""""""""
Development snapshot with AWS Cloud Formation support

1.0.90
""""""
Fixed a bug causing crash after setting up mass storage click-me file
on Linux.

1.0.88
""""""
- Reset debugger after disk click-me is updated, eliminating the need to
  unplug the kit to make the update effective. Note that this causes any
  file browser open in the Curiosity mass-storage folder to close.

- AVR Google demo firmware has been updated to eliminate issue with
  drag-n-drop WiFi configuration.
