load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_net.js');
load('api_sys.js');
load('api_mqtt.js');
load('api_timer.js');
load('api_esp32.js');

let ON = 1;
let OFF = 0;

let led = 13;
let ledIsOn = false;
let isMqqtConnected = false;

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
	publishData();
}

function turnOffLed(){
	print("turning off led...")
	ledIsOn = false;
	GPIO.write(led,OFF);
	publishData();
}

let getInfo = function() {
  return JSON.stringify({
    deviceId: deviceName,
	led_state: getLedState()
  });
};

function publishData() {
  let message = getInfo();
  let ok = MQTT.pub(topic, message);
  
  print('Published:', ok, topic, '->', message);
  return ok;  
}

function updateLedStatus(status){
	if(status === "1"){ // if message is on
		turnOnLed();
	}
	else if(status === "0"){ // if message is on
		turnOffLed();
	}
	else{
		print('WTF');
	}
}

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
      Cfg.set({ app: obj });//TODO:ffind out why its not saving
    }
	updateLedStatus(obj.ledState);
  },
  null
);

// Monitor connection with MQTT server
MQTT.setEventHandler(function(conn, ev) {
  if (ev === MQTT.EV_CONNACK) {
    print('MQTT CONNECTED');
    isMqqtConnected = true;
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
