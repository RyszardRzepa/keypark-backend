# keypark-backend

### The product overivew
The product is a modular box with colling system which will be placed in the Companies building or shopping mall.
Shopping mall will get access to web dashboard and API, so they can controll the box to do actions like:
- open the box
- close the box
- check the temperature
- check if the box is avaiable

The box will use esp32 to controll the lock, send temperature data to the backend system via google iot core.

### How the system will work
1) We will use esp32 to controll the box.
2) We will use google iot core to create keys to establish secure communication between the cloud and esp32.
3) We will use google cloud functions for triggering the device config updates. We will only do 1 type of update to the devie. 
We will ask device to open the lock or close the lock.
4) The device will send data to firestore database about the temperature in the box. This will be a interval of 600sec.
![alt text](https://storage.googleapis.com/gcp-community/tutorials/cloud-iot-firestore-config/architecture.png)

### What need to be done
1) Think about the security in the first place!!!
2) Create a documentaion with the steps, how to setup esp32 with google iot core, install firmware in esp32 in the production enviroment.
3) Crete a setup for OTA updates. Make it in the secure way.
4) Setup for esp32 Flash encryption. We need a place to keep encrypted keys for each device.
5) Setup for configurating wifi via web/mobile app.
![alt text](https://scontent-arn2-1.xx.fbcdn.net/v/t1.0-9/32698223_1039122062918068_680439741581099008_n.jpg?_nc_cat=0&oh=70a60835c6596f3a15536f9b17bc4000&oe=5BAAF08D)
