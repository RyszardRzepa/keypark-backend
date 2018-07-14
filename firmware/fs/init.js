load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_net.js');
load('api_sys.js');
load('api_rpc.js');
load('api_timer.js');
load('api_mqtt.js');
load('api_esp32.js');

let ON = 1;
let OFF = 0;

let led = 4;
let button = 0;
let ledIsOn = false;
let isMqqtConnected = false;
const firmwareVersion = Cfg.get('app.firmware_version');

//let first_boot_flag = ffi('bool mgos_upd_is_first_boot(void)')();//TODO: Figure out why flag is not set
let first_boot_flag = true; 

let deviceName = Cfg.get('device.id');
let topic = '/devices/' + deviceName + '/events';
let configTopic = '/devices/' + deviceName + '/config';

GPIO.set_mode(led, GPIO.MODE_OUTPUT);
GPIO.write(led, 0); // Turn off led

function getLedState(){
	return ledIsOn?" ON":" OFF";
}

function turnOnLed(){
	print("turning on led...")
	ledIsOn = true;
	GPIO.write(led,ON);
	let message = getInfo();
	publishData(message);
}

function turnOffLed(){
	print("turning off led...")
	ledIsOn = false;
	GPIO.write(led,OFF);
	let message = getInfo();
	publishData(message);
}

let getInfo = function() {
  return JSON.stringify({
    deviceId: deviceName,
	led_state: getLedState()
  });
};

function updateDeviceState(){

	let status = Cfg.get('app.ledState');
	if(status === "1"){ // ON
		turnOnLed();
	}
	else if(status === "0"){ // OFF
		turnOffLed();
	}
	else{
		print('WTF');
	}
}

function firmwareUpdate(){
	print('updating firmware...');
	let url = Cfg.get('app.update_url');
	let timeout = Cfg.get('app.update_timeout');
	
	RPC.call(RPC.LOCAL,'OTA.Update',{"url": url, "commit_timeout": timeout},
	function (resp, ud) {
		print('Response:', JSON.stringify(resp));
	}, null);
}

function firmwareCommit(){
	print('Commiting firmware...');
	RPC.call(RPC.LOCAL,'OTA.Commit',null,function (resp, ud) {
		print('Response:', JSON.stringify(resp));
	}, null);
}

function publishData(message) {
  let ok = MQTT.pub(topic, message);
  
  print('Published:', ok, topic, '->', message);
  return ok;  
}

GPIO.set_mode(led, GPIO.MODE_OUTPUT);
Timer.set(5000 /* 1 sec */, Timer.REPEAT, function() {
  print('uptime:', Sys.uptime());
}, null);

// Restart AP mode on button press
GPIO.set_button_handler(button, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 20, function() {
  {
	  Cfg.set({wifi: {ap: {enable: true}}}); //Enable AP and start serving Web page when button is pressed
	  Cfg.set({wifi: {sta: {enable: false}}}); //Disable station mode
	  Cfg.set({wifi: {sta: {ssid: ""}}}); //Clear SSID
	  Cfg.set({wifi: {sta: {ssid: ""}}}); //Clear Password
	  Sys.reboot(0); //Restart device
  }
}, null);

// Subscribe to Cloud IoT Core configuration topic
MQTT.sub(
  configTopic,
  function(conn, topic, msg) {
    print('Got config update:', msg.slice(0, 100));
    if (!msg) {
      return;
    }
    let obj = JSON.parse(msg);
    if (obj) {
	  Cfg.set({ app: obj });// update and save all values
	  if (obj.heading === "update"){
			//update is available, check if firmware update is different from installed version
			if(obj.firmware_ver !== firmwareVersion){
				//update.
				firmwareUpdate();
			}
		}
	  if(obj.heading === "commit"){
		//update is approved, commit.
		firmwareCommit();
	  }
	  if(obj.heading === "event"){
		//Lock/Unlock device
		updateDeviceState();
	  }
    }
	
  },
  null
);

// Monitor connection with MQTT server
MQTT.setEventHandler(function(conn, ev) {
  if (ev === MQTT.EV_CONNACK) {
    print('MQTT CONNECTED');
    isMqqtConnected = true;
	{
		if(first_boot_flag === true){ // TODO:Send this message only after update
			print('First Boot,Commit software');
			publishData(JSON.stringify({
					deviceId: deviceName,
					firmware: firmwareVersion
				})
			);
			first_boot_flag = false;
		}
	}
  }
}, null);


Timer.set(5000 /* 1 sec */, Timer.REPEAT, function() {
  print('online', 'uptime:', Sys.uptime());
}, null);

// Monitor network connectivity.
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:', ev, evs);
}, null);
