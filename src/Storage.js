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
    findUser(service, name){
        const userIndex = this.findWithAttr(require('../storage/passwords.json'), "user", name);
        return userIndex;
    }
    // Merges the password dataset with the entire database before saving it to JSON
    // Must be always used before saving or loss of data will occur
    mergeDatabase(dataset){
        const database = require('../storage/passwords.json');
        const index = this.findUser('user', this.user);
        console.log(index)

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
        const cryptr = new Cryptr(password);

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
    createUser(name, password){
        const bcrypt = require('bcrypt');
        const data = {
            user: name,
            password: bcrypt.hashSync(password, 10),
            passwords: []
        }
        const database = require('../storage/passwords.json');
        database.push(data);
        this.saveJSON(database, './storage/passwords.json');
    }
    // Checks the hash and returns true or false
    validateUser(name, password){
        const bcrypt = require('bcrypt');
        const database = require('../storage/passwords.json');
        const validation = bcrypt.compareSync(password, database[this.findUser('user', name)].password);

        if(validation==true){
            console.log("User authenticated");
        }
        else{
            console.log("Authentication failed");
        }
        return validation;
    }
}

module.exports = Storage