const Datastore = require('nedb-promises');

class Model{
    constructor(values){
        let con = this.constructor;
        con.tableName = con.tableName ? con.tableName.toLowerCase() : con.name.toLowerCase();
        con.timestamp = con.hasOwnProperty('timestamp') ? con.timestamp : true;

        Object.keys(con.properties).forEach(key => {
            this[key] = null;

            this['_id'] = null;

            let def = con.properties[key].default;
            if(def) this[key] = def;
        });

        if(con.timestamp){
            this['_created'] = null;
            this['_updated'] = null;
        }

        if(typeof values !== 'undefined') this.set(values);
    }

    getDatasrote(){
        if(!this.constructor.datastore) this.constructor.datastore = Datastore.create(`./database/${this.constructor.tableName}.db`);
        return this.constructor.datastore;
    }

    get(key = null){
        if(key) this.checkKey(key);
        return key ? this[key] : Object.keys(this).reduce((res, el) => {
            let isProtected = this.constructor.properties[el] && this.constructor.properties[el].hasOwnProperty('protected') ? this.constructor.properties[el].protected : false;
            if(!isProtected) res[el] = this[el];
            return res;
        }, {});
    }

    set(key, value=null){        
        if(typeof key === "string"){
            this.setAttribute(key, value);
        }else{
            value = key;
            if(Array.isArray(value) || typeof value === 'string'){
                console.error(`Please set value using Object.`);
            }

            Object.keys(value).forEach(key => {
                if(this.hasOwnProperty(key)) this.setAttribute(key, value[key]);
            })
        }

        return this;
    }

    setAttribute(key, value){
        this.checkKey(key);
        this[key] = value;
    }

    checkKey(key){
        if(!this.hasOwnProperty(key)){
            console.error(`Attribute "${key}" is not found!`);
        }
    }

    validate(){
        let errors = [];
        let properties = this.constructor.properties;
        Object.keys(properties).map(key => {
            if(properties[key].required){
                let required = properties[key].required;
                if(required && !this[key]){
                    errors.push({[key]: `${key} is required!`});
                }
            }
        })

        return errors;
    }

    async save(){
        return new Promise(async (resolve, reject) => {
            let errors = this.validate();
            if(errors.length){
                reject(errors);
                return;
            };

            if(this.constructor.timestamp){
                if(!this._created) this._created = new Date().toJSON();
                this._updated = new Date().toJSON();
            }
           
            if(typeof this.beforeSave === 'function') await this.beforeSave(doc);
           
            let action = null;
            if(this._id){
                action = this.getDatasrote().update({_id: this._id}, this);
            }else{
                delete this._id;
                action = this.getDatasrote().insert(this);
            }

            await action.then(async (doc) => {
                this._id = doc._id ? doc._id : this._id;
                if(typeof this.afterSave === 'function') await this.afterSave(doc);
                resolve(this);
            }).catch(err => reject(err));
        });
    }

    static find(conditions={}, limit=0, sort=null){
        return new Promise((resolve, reject) => {
            let data = new this().getDatasrote().find(conditions);

            if(limit){
                data.limit(limit);
            }

            if(sort){
                data.sort(sort);
            }

            data.then(docs => resolve(docs.map(el => new this(el).get()))).catch(err => reject(err));
        });
    }

    static findById(id){
        return new Promise((resolve, reject) => {
            new this().getDatasrote().findOne({_id: id}).then(doc => resolve(doc ? new this(doc) : null)).catch(err => reject(err));
        });
    }

    static findOne(conditions){
        return new Promise((resolve, reject) => {
            new this().getDatasrote().findOne(conditions).then(doc => resolve(doc ? new this(doc) : null)).catch(err => reject(err));
        });
    }

    static removeById(id){
        return new Promise((resolve, reject) => {
            new this().getDatasrote().remove({_id: id}).then(() => resolve(true)).catch(err => reject(err));
        });
    }
}

module.exports = Model;