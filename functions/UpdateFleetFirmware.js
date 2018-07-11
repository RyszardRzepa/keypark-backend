const functions = require('firebase-functions');
const admin = require('firebase-admin');

const {GoogleApis} = require('googleapis');
const googleapis = new GoogleApis();
var cloudiot = googleapis.cloudiot('v1');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const PROJECT_ID = process.env.GCLOUD_PROJECT;
const REGION = 'us-central1';
const REGISTRY = 'esp32-registry';
const API_SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];

var updateUrl = "";
var timeout = 0;

function handleBatchGet(authClient, name, err, data) {
    
	if (err) {
        console.log('Error with get device:');
        console.log(err);
        return;
    }
	
	const newConfig = { 
		heading: "update",
		update_url: updateUrl,
		update_timeout: timeout
	};
	
    const configData = new Buffer(JSON.stringify(newConfig), 'utf-8');
    const binaryData = configData.toString('base64');
	
    var request2 = {
        name: name,
        resource: {
            'versionToUpdate' : 0,
            'binaryData' : binaryData
        },
        auth: authClient
    };

    console.log(request2);

    var devices = cloudiot.projects.locations.registries.devices;
    devices.modifyCloudToDeviceConfig(request2, (err, mydata) => {
        if (err) {
            console.log('Error patching device:');
            console.log(err);
        } else {
            console.log('Patched device:');
            console.log(mydata);
        }
    });
}

function handleBatchAuth(err, authClient) {

    if (err) {
        console.log(err);
    }

    if (authClient.createScopedRequired &&
        authClient.createScopedRequired()) {
        authClient = authClient.createScoped(
            API_SCOPES);
    }
	
	var deivesRef = db.collection('devices');
	var devices = deivesRef.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
		
        console.log(doc.id);
		
		var dev_id = doc.id;
		var name = `projects/${PROJECT_ID}/locations/${REGION}/registries/${REGISTRY}/devices/${dev_id}`;
		
		var request = {
			name: name,
			auth: authClient
		};
		// Get device version
		var devices = cloudiot.projects.locations.registries.devices;
		devices.get(request, (err, data) =>
					handleBatchGet(authClient, name, err, data));
					
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
}

/**
 * This function triggers a firmware update on all the devices  
 * stored in the database. It uses the updateDeviceConfig method
 * to trigger a firmware update.
 */
module.exports = function (url, time) {

  console.log(updateURL);
  if (updateURL === null) {
    return Error( 'Param `url` is required!');
  }

  console.log(time);
  if (time === null) {
    return Error( 'Param `commitTimeout` is required!');
  }

  updateUrl = url;
  timeout = time;

  return googleapis.auth.getApplicationDefault(handleAuth);
};