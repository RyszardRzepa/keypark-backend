
# OTA update procedure

## Overview

- To update the device, a built version of the update is required in a zip file. This zip file may be 
obtained from the build folder in the fw directory. (eg firmware/build/fw/build.zip)
- Before building the updated firmware, update the firmware version [app.firmware_version] in the mos.yml file.
the device will check this version with the current version and only perform an update if the two are different
- Once built, the zip file is to be uploaded to a server, this will be the directory from which the device downloads
the firmware. The free version of mongoose-os only allows downloads from the mongoose dashboard. Upload the 
firmware to the dash-baord and obtain the download url
- A function [UpdateFleetFirmware], with an http endpoint is provided. This function receives three parameters.
1. The firmware download url
2. The commit time-out (This is the time after the update that the server must explicitly commit the firmware. If
the commit command is not received from the server within this period, a roll-back to the previous firmware will occur)
3. The firmware version
- Call the function and the update will be pushed to all devices in the database.

