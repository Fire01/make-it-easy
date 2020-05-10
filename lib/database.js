const fs = require("fs");
const path = require('path');
const Datastore = require('nedb');

class Database{

    static path = path.join(process.cwd(), 'database');

    static getDatabases(){
        let databases = [];
        fs.readdirSync(Database.path).forEach((file) => {
            let ext = file.split('.').pop();
            if(ext === 'db' && file !== 'session.db'){
                databases.push(file);
            }
        });
        
        return databases;
    }

    static autoCompact(milisecond){
        let interval = (typeof milisecond === "number" ? milisecond : 60 * 60 * 1000);
        if(interval < 10000) interval = 10 * 1000;        
        
        setTimeout(() => {
            let dbs = Database.getDatabases();
            console.log(`--------------- Compacting Database : ${dbs.join(", ")} ---------------`);
            dbs.forEach(dbName => {
                let db = new Datastore(path.join(Database.path, dbName));
                db.loadDatabase();
                db.persistence.compactDatafile(interval);
            });

            Database.autoCompact(interval);
        }, interval);
    }

}

module.exports = Database;