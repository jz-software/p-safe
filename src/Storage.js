class Storage{
    constructor(){
        
    }
    saveJSON(myObject, path){
        var fs = require('fs');
        var data = JSON.stringify(myObject);

        fs.writeFile(path, data, function (err) {
        if (err) {
            console.log('There has been an error saving your data.');
            console.log(err.message);
            return;
        }
        console.log('Data saved successfully.')
        });
    }
    encryptString(string, password){
        const Cryptr = require('cryptr');
        const cryptr = new Cryptr(password);
        
        return cryptr.encrypt(string);
    }
    savePassword(dataset, service, toStore, password){
        const saveData = {
            service: service,
            password: this.encryptString(toStore, password)
        }
        dataset.push(saveData)
        this.saveJSON(dataset, './storage/passwords.json')
    }
    changePassword(dataset, index, newValue, password){
        dataset[index].password = this.encryptString(newValue, password);
        this.saveJSON(dataset, './storage/passwords.json');
    }
    removePassword(dataset, toRemove){
        dataset.splice(toRemove, 1);
        this.saveJSON(dataset, './storage/passwords.json');
    }
}

module.exports = Storage