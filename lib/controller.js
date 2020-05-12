const createError = require('http-errors');

class Controller{
    
    constructor(configs={}){
        this.name = configs.name.toLowerCase();
        this.path = configs.path ? configs.path : null;
        this.method = configs.method ? configs.method : null;
        this.acl = typeof configs.acl === 'string' ? [configs.acl] : (Array.isArray(configs.acl) ? configs.acl : ['*']);
        this.csrf = configs.csrf ? configs.csrf : null;
        if(configs.fn) this.fn = configs.fn;
        this.userAccess = null;
    }

    haveRoles(roles){
        let result = false;
        let uroles = this.userAccess && Array.isArray(this.userAccess.roles) && this.userAccess.roles.length ?  this.userAccess.roles : [];

        if(Array.isArray(roles)){
            roles.forEach(role => {
                if(uroles.indexOf(roles) !== -1) result = true;
            })
        }else{
            result = uroles.indexOf(roles) !== -1;
        }

        return result;
    }

    async init(req, res, next){
        this.userAccess = req.session.user ? req.session.user : null;
        let isAuthorized = false;
        for(let el of this.acl){
            if(el === '*') isAuthorized = true;
            if(el === '@' && req.session.user) isAuthorized = true;
            
            if(this.haveRoles(el)) isAuthorized = true;
        }
        
        if(isAuthorized) return this.fn(req, res, next);

        if(this.acl.indexOf("@") !== -1 && Utils.getRoute('login')) return res.redirect(Utils.getRoute('login'));
        
        return next(createError(403, `You not authorized to access this page!`));
    }
}

module.exports = Controller;