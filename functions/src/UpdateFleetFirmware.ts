import api from './GlobalVariables';

const cloudiot = api.googleapis.cloudiot('v1');

const PROJECT_ID = 'keypark-backend';
const REGION = 'europe-west1';
const REGISTRY = 'asset-tracker-registry';

const API_SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];

var updateUrl = "";
var timeout = 0;
var firmwareVersion = "";

function handleBatchGet(authClient, name, err, data) {
    
	if (err) {
        console.log('Error with get device:');
        console.log(err);
        return;
    }
	
	const newConfig = { 
		heading: "update",
		update_url: updateUrl,
		update_timeout: timeout,
		firmware_ver: firmwareVersion
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
	
	var deivesRef = db.collection('locks');
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
module.exports = function (req, res) {
  
  const url = req.query.url;
  const commitTimeout = req.query.time;
  const version = req.query.ver;

  if (url === null) {
    return null;
	//return Error( 'Param `url` is required!');
  }

  if (commitTimeout === null) {
	return null;
    //return Error( 'Param `commitTimeout` is required!');
  }

  if (version === null) {
	return null;
    //return Error( 'Param `version` is required!');
  }

  updateUrl = url;
  timeout = commitTimeout;
  firmwareVersion = version;

  return api.googleapis.auth.getApplicationDefault(handleAuth);
};