class Controller{
    name = null;
    path = null;
    method = null;
    acl = ["*"];
    csrf = null;
    userAccess = null;

    constructor(configs={}){
        this.name = configs.name.toLowerCase();
        this.path = configs.path;
        this.method = configs.method;
        this.acl = typeof configs.acl === 'string' ? [configs.acl] : (Array.isArray(configs.acl) ? configs.acl : ['*']);
        this.csrf = configs.csrf;
        if(configs.fn) this.fn = configs.fn;
    }

    async init(req, res, next){
        this.userAccess = req.session.user ? req.session.user : null;
        let roles = this.userAccess && Array.isArray(this.userAccess.roles) && this.userAccess.roles.length ?  this.userAccess.roles : [];
        let isAuthorized = false;
        for(let el of this.acl){
            if(el === '*') isAuthorized = true;
            if(el === '@' && req.session.user) isAuthorized = true;
            
            roles.forEach(role => {
                //if(role.toLowerCase() === el.toLowerCase()) isAuthorized = true;
                if(role === el) isAuthorized = true;
            })
        }
        
        if(isAuthorized) return this.fn(req, res, next);

        if(this.acl.indexOf("@") !== -1 && Utils.getRoute('login')) return res.redirect(Utils.getRoute('login'));
        
        let err = new Error(`You not authorized to access this page!`);
        err.status = 404;
        return next(err);

    }
}

module.exports = Controller;