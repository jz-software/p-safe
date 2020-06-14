class Storage{
    constructor(){
        
    }
    user;
    password;

    // Saves an object in a JSON file.
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

    // Encrypts a string using Cryptr
    encryptString(string, password){
        const Cryptr = require('cryptr');
        const cryptr = new Cryptr(password);
        
        return cryptr.encrypt(string);
    }
    decryptString(string, password){
        const Cryptr = require('cryptr');
        const cryptr = new Cryptr(password);
        
        return cryptr.decrypt(string);
    }

    // Finds index in array of objects using an attribute
    findWithAttr(array, attr, value) {
        for(var i = 0; i < array.length; i += 1) {
            if(array[i][attr] === value) {
                return i;
            }
        }
        return -1;
    }

    // Finds an user and returns its index
    // If user is not found then returns -1
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
    mergeUser(dataset){
        const database = require('../storage/passwords.json');
        console.log(database)
        const index = this.findUser('user', this.user);
        console.log(index)

        database[index] = dataset;
        return database;
    }

    makeString(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
     
    savePassword(dataset, service, login, toStore, icon){
        const fs = require('fs');
        const path = require('path');

        const saveData = {
            service: service,
            login: login,
            password: this.encryptString(toStore, this.password),
            icon: `${this.makeString(32)}.${path.extname(icon)}`
        }

        fs.copyFile(icon, `./storage/icons/${saveData.icon}`, (err) => {
            if (err) throw err;
            console.log('Icon was copied to ./icons/');
        });

        dataset.push(saveData)

        this.saveJSON(this.mergeDatabase(dataset), './storage/passwords.json')
    }
    changePassword(dataset, index, newValue, password){
        dataset[index].password = this.encryptString(newValue, password);
        this.saveJSON(dataset, './storage/passwords.json');
    }
    removePassword(dataset, toRemove){
        const fs = require('fs')
        try {
            fs.unlinkSync(`./storage/icons/${dataset[toRemove].icon}`)

        } catch(err) {
            console.error(err)
        }

        dataset.splice(toRemove, 1);
        this.saveJSON(this.mergeDatabase(dataset), './storage/passwords.json');

    }
    decryptAll(dataset){
        const Cryptr = require('cryptr');
        const cryptr = new Cryptr(this.password);

        const decrypted = [];
        for(let i=0; i<dataset.length; i++){
            const toSave = {
                service: dataset[i].service,
                login: dataset[i].login,
                password: cryptr.decrypt(dataset[i].password),
                icon: dataset[i].icon
            }
            decrypted.push(toSave);
        }        
        return decrypted;
    }
    decryptString(string){
        const Cryptr = require('cryptr');
        const cryptr = new Cryptr(this.password);

        return cryptr.decrypt(string);
    }
    createUser(name, email, password){
        const bcrypt = require('bcrypt');
        const data = {
            user: name,
            email: this.encryptString(email, password),
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
    getAllUsers(){
        const database = require('../storage/passwords.json');
        const userArray = [];
        for(let i=0; i<database.length; i++){
            userArray.push(database[i].user)
        }
        return userArray;
    }
    changeUser(user, dataset){
        dataset.user = user.login;
        dataset.email = this.encryptString(user.email, this.password);

        this.user = user.login;

        this.saveJSON(this.mergeUser(dataset), './storage/passwords.json');
    }

}

module.exports = Storage
