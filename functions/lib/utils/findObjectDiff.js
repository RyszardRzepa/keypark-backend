"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function difference(after, before) {
    function changes(object, base) {
        return _.transform(object, function (result, value, key) {
            if (!_.isEqual(value, base[key])) {
                result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
            }
        });
    }
    return changes(after, before);
}
module.exports = difference;
//# sourceMappingURL=findObjectDiff.js.map