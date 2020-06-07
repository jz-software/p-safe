const dataset = require('./storage/passwords.json')
const Storage = require('./src/Storage')

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}
function findService(service){
    const serviceIndex = findWithAttr(dataset, "service", service);
    return serviceIndex;
}

const storage = new Storage();

// Storage interaction
//storage.savePassword(dataset, "GitHub", "passwordToStore", "mainPassword");
//storage.removePassword(dataset, findService("GitHub"));
//storage.changePassword(dataset, findService("GitHub"), "newPassword", "mainPassword");