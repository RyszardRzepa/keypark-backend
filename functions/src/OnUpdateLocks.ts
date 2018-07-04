const UpdateDeviceConfig = require('./UpdateDeviceConfig');
const findObjectDiff = require('./utils/findObjectDiff');

module.exports = async function (change, context) {
    const dataAfter = change.after.data();
    const dataBefore = change.before.data();

    //check if lock get new user or update to the existing user
    if (dataAfter.locked === dataBefore.locked &&
        dataAfter.available === dataBefore.available &&
        dataAfter.name === dataBefore.name &&
        dataAfter.roles === dataBefore.roles
    ) {
        //double check for diff in user
        const diff = findObjectDiff(dataBefore, dataAfter);
        if (diff) {
            // log diff
            console.log('diff keys', Object.keys(diff), 'dif', diff)

            return null;
        } else {
            console.log(' noo diff', Object.keys(diff))
            return null;
        }
    }
    // if locked filed is updated updateDeviceConfig
    if (change.after.data().locked === change.before.data().locked) {
        return null;
    }

    const deviceValue = change.after.data().locked ? '1' : '0';
    const devId = context.params.lockId;
    return UpdateDeviceConfig(devId, deviceValue)
};
