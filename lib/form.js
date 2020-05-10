const humanizeString = require('humanize-string');
const createError = require('http-errors');
const Controller = require("./controller");

class Form extends Controller{
    title = null;
    action = "";
    editMode = true;
    csrfToken = null;
    items = {};
    data = null;
    actionbars = [];
    view = null;
    readers = true;
    authors = true;
    javascripts = [];
    variables = {};
    vars = {};
    styles = [];

    constructor(model, configs={}){
        super(configs);

        if(!model){
            if(typeof configs.callback === 'function'){
                this.callback = configs.callback;
            }else{
                console.log("\x1b[31m%s\x1b[0m", `Form "${this.name}" doesn't have callback. Form without model must have callback function!`);
                process.exit(1);
            }
        }

        this.method = "GET|POST|DELETE";
        this.model = model;
        Object.keys(configs.items).forEach(item => this.items[item] = Object.assign({}, model ? model.properties[item] : {}, configs.items[item]));
        
        this.title = configs.title ? configs.title : (model ? humanizeString(model.name) : 'Untitled');
        this.editMode = configs.hasOwnProperty('editMode') ? configs.editMode : true;
        this.readers = configs.hasOwnProperty('readers') ? configs.readers : true;
        this.authors = configs.hasOwnProperty('authors') ? configs.authors : true;

        this.javascripts = configs.javascripts && configs.javascripts.length ? (Array.isArray(configs.javascripts) ? configs.javascripts : [configs.javascripts]) : [];
        this.styles = configs.styles && configs.styles.length ? (Array.isArray(configs.styles) ? configs.styles : [configs.styles]) : [];
        this.setVariables(configs.variables);

        this.beforeOpen = configs.beforeOpen;
        this.beforeSave = configs.beforeSave;
        this.afterSave = configs.afterSave;

        return this;
    }

    setVariables(vars){
        if(vars){
            this.variables = vars;
            for(let v in vars){
                let item = vars[v];

                if(typeof item !== "function"){
                    if(item[Symbol.toStringTag] === 'Promise'){
                        item.then(res => this.vars[v] = res).catch(err => console.log(`ERROR: [${this.name}]Variables: ${v}`, err));
                    }else{
                        this.vars[v] = item;
                    }
                }
            }
        }
    }

    async populateVars(){
        for(let v in this.variables){
            let item = this.variables[v];

            if(typeof item === "function"){
                this.vars[v] = await item();
            }
        }
    }

    normalizeItems(items){
        const args = {
            value: null,
            data:this.data, 
            editMode: this.editMode,
            vars: this.vars,
            userAccess: this.userAccess,
        }

        return Object.keys(items).map(el => {
            args.value = this.data && this.data[el];

            const item = Object.assign({}, items[el]);

            let value = null;
            if(item.type === 'computed') value = item.value;
            else value = this.data && this.data.hasOwnProperty(el) && this.data[el] !== null ? this.data[el] : (item.hasOwnProperty('value') ? item.value : null);

            if(typeof value === 'function'){
                value = value(args);
            }
            
            item.value = value;
            
            item.key = el;
            item.label = item.label ? item.label : humanizeString(el);
            item.name = this.name ? this.name + "[" + el + "]" : el;
            item.id = this.name ? this.name + "_" + el : el;
            item.type = item.type ? item.type : 'text';
            item.className = item.className ? item.className : '';
            item.required = item.hasOwnProperty('required') ? (typeof item.required === 'function' ? item.required(args) : item.required) : false;
            item.disabled = item.hasOwnProperty('disabled') ? (typeof item.disabled === 'function' ? item.disabled(args) : item.disabled) : false;
            item.hide = item.hasOwnProperty('hide') ? (typeof item.hide === 'function' ? item.hide(args) : item.hide) : false;
            if(item.options && typeof item.options === 'function') item.options = item.options(args);
            
            if(item.items) item.items = this.normalizeItems(item.items);

            return item;
        });
    }

    getItemsConfig(){
        return this.normalizeItems(this.items);
    }

    getActionbars(){
        let actions = [];
        
        if(this.actionbars.length){
            actions = this.actionbars;
        }else{
            if(this.editMode){
                actions.push({type: 'submit', text: 'Save', icon: 'check square'});
                actions.push({type: 'close'});
            }else{
                actions.push({type: 'linkButton', text: 'Edit', icon: 'edit', location: this.path + '?OpenForm&id=' + this.data._id, target: '_self'});
                actions.push({type: 'button', text: 'Delete', icon: 'minus circle', fn: `deleteDoc()`});
                actions.push({type: 'close'});
            }
        }

        return actions.map(el => Utils.twig.action(el));
    }

    getFormConfig(){
        return {
            name: this.name,
            title : this.title,
            action: this.action,
            editMode: this.editMode,
            csrfToken: this.csrfToken,
            items: this.getItemsConfig(),
            data: this.data,
            actionbars: this.getActionbars(),
            javascripts: this.javascripts,
            styles: this.styles,
            vars: this.vars
        }
    }

    async serialize(doc, body){
        const args = {
            value: null,
            data: this.data, 
            editMode: this.editMode,
            vars: this.vars,
            userAccess: this.userAccess,
        };

        let serialized = {};
        for(let item in this.items){
            let attribute = this.items[item];
            args.value = doc[item];
            switch(attribute.type){
                case 'number':
                    serialized[item] = parseInt(body[item] ? body[item] : 0);
                    break;
                case 'computed':
                    if(typeof attribute.value === "function"){
                        serialized[item] = attribute.value(args);
                    }
                    break;
                case 'date':
                    serialized[item] = new Date(body[item]).toJSON();
                    break;
                case 'model':
                    if(attribute.multiple){
                        let docVal = Array.isArray(doc[item]) ? doc[item] : (doc[item] ? [doc[item]] : []);
                        let val = Array.isArray(body[item]) ? body[item] : (body[item] ? [body[item]] : []);

                        serialized[item] = [];
                        for(let v of val){
                            let ref = docVal.find(d => d && d._id === v);
                            if(!ref) {
                                ref = await attribute.model.findById(v);
                                ref = ref.get();
                            };
                            serialized[item].push(ref);
                        }
                    }else{
                        serialized[item] = null;
                        if(body[item]){
                            if(doc[item] && doc[item]._id == body[item]){
                                serialized[item] = doc[item];
                            }else{
                                let ref = await attribute.model.findById(body[item]);
                                serialized[item] = ref.get();
                            }
                        }
                        
                    }
                    break;
                case 'items':
                    serialized[item] = JSON.parse(body[item]);
                    break;
                default:
                    serialized[item] = body[item];
                    break;
            }
        } 

        return serialized;
    }

    async fn(req, res, next){

        if(req.xhr && req.method === "GET"){
            const ref = req.query.hasOwnProperty('reference') ? true: false;

            if(ref){
                const key = req.query.key;
                const q = req.query.query;
                const item  = this.items[key];
                
                if(item){
                    let find = {};
                    let sort = {};
                    find[item.display] = new RegExp('^' + q, "i");
                    sort[item.display] = 1;

                    item.model.find(find, 20, sort).then(result => {
                        return res.json({
                            success: true,
                            results: result.map(el => ({name: el[item.display], value: el['_id'], text: el[item.display]}))
                        });
                    }).catch(err => res.json({success: false, errors: err}));
                }
            }

            return false;
        }

        await this.populateVars();

        if(req.method === "GET" || req.method === "POST"){
            let doc = null;
            if(this.model){
                doc = new this.model();
                if(req.query.id){
                    doc = await this.model.findById(req.query.id);
                    if(!doc){
                        return next(createError(404, `${this.title} "${req.query.id}" was not found!`));
                    }
                }
            }

            if(req.method === "GET"){
                const authorizedReaders = typeof this.readers === 'function' ? (doc._id ? this.readers({doc: doc, userAccess: this.userAccess, hasRoles: this.haveRoles}) : true) : this.readers;
                if(!authorizedReaders){
                    return next(createError(403, `You not authorized to access this page!`));
                }

                this.csrfToken =  req.csrfToken();
                this.editMode = req.query.hasOwnProperty('OpenForm') ? true : (req.query.id ? false : true);
                this.data = doc;
                
                if(typeof this.beforeOpen === "function") await this.beforeOpen({items: this.items, data: this.data, editMode: this.editMode});
                
                return res.render('_base/form', {form: this.getFormConfig()});
            }else{
                const authorizedAuthors = typeof this.authors === 'function' ? (doc._id ? this.authors({doc: doc, userAccess: this.userAccess, hasRoles: this.haveRoles}) : true) : this.authors;
                if(!authorizedAuthors){
                    return next(createError(403, `You not authorized to access this page!`));
                }
                const prevDoc = Object.assign({}, doc);
                const serialized = await this.serialize(doc, req.body[this.name]);
                if(doc) doc.set(serialized);
                
                if(typeof this.beforeSave === "function") await this.beforeSave({doc: doc, prevDoc: prevDoc, serialized: serialized, data: req.body[this.name]});
                
                if(doc){
                    doc.save()
                    .then(async(ndoc) => {
                        if(typeof this.afterSave === "function") await this.afterSave({doc: doc, ndoc: ndoc});
        
                        return res.redirect(req.path + '?ReadForm&id=' + ndoc._id);
                    })
                    .catch(err => {
                        this.data = doc;
                        return res.render('_base/form', {form: this.getFormConfig(), errors: err});
                    });
                }else{
                    return this.callback(req, res, next, this);
                }
            }
        }

        if(req.method === "DELETE"){
            const ids = req.body.id ? (Array.isArray(req.body.id) ? req.body.id : [req.body.id]) : [];
            const errors = [];
           
            for(let id of ids){
                const doc = await this.model.findById(id);
                const authorizedAuthors = typeof this.authors === 'function' ? (doc._id ? this.authors({doc: doc, userAccess: this.userAccess, hasRoles: this.haveRoles}) : true) : this.authors;
                if(!authorizedAuthors){
                    let name = Utils.findFirstValue(doc);
                    errors.push(`You not authorized to delete ${name ? 'document ' + name : ' this document'}!`);
                }else{
                    await this.model.removeById(id).catch(err => errors.push(err));
                }
            }
            
            return res.json({success: errors.length ? false : true, errors: errors});
        }

    }
}

module.exports = Form;