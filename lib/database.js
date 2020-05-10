const fs = require("fs");
const path = require('path');
const Datastore = require('nedb');

class Database{

    static path = path.join(process.cwd(), 'database');

    static getDatabases(){
        let databases = [];
        fs.readdirSync(Database.path).forEach((file) => {
            databases.push(file);
        });

        return databases;
    }

    static autoCompact(minutes=60){
        let interval = minutes * 60 * 1000;
        const dbs = Database.getDatabases();
        dbs.forEach(dbName => {
            if(dbName !== 'session.db'){
                let db = new Datastore(path.join(Database.path, dbName));
                db.loadDatabase();
                db.persistence.setAutocompactionInterval(interval);
            }
        });
    }

}

module.exports = Database;