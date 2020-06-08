class Storage{
    constructor(){
        
    }
    user;
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
    findWithAttr(array, attr, value) {
        for(var i = 0; i < array.length; i += 1) {
            if(array[i][attr] === value) {
                return i;
            }
        }
        return -1;
    }
    findUser(service){
        const userIndex = this.findWithAttr(require('../storage/passwords.json'), "user", this.user);
        return userIndex;
    }
    mergeDatabase(dataset){
        const database = require('../storage/passwords.json');
        const index = this.findUser(this.user);

        database[index].passwords = dataset;
        return database;
    }
    savePassword(dataset, service, login, toStore, password){
        const saveData = {
            service: service,
            login: login,
            password: this.encryptString(toStore, password)
        }
        dataset.push(saveData)

        this.saveJSON(this.mergeDatabase(dataset), './storage/passwords.json')
    }
    changePassword(dataset, index, newValue, password){
        dataset[index].password = this.encryptString(newValue, password);
        this.saveJSON(dataset, './storage/passwords.json');
    }
    removePassword(dataset, toRemove){
        dataset.splice(toRemove, 1);

        this.saveJSON(this.mergeDatabase(dataset), './storage/passwords.json');
    }
    decryptAll(dataset, password){
        const Cryptr = require('cryptr');
        const cryptr = new Cryptr('ShrekSensei33');

        const decrypted = [];
        for(let i=0; i<dataset.length; i++){
            const toSave = {
                service: dataset[i].service,
                login: dataset[i].login,
                password: cryptr.decrypt(dataset[i].password)
            }
            decrypted.push(toSave);
        }        
        return decrypted;

    }
}

module.exports = Storage