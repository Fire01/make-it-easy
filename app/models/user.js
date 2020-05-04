const Model = require("make-it-easy").model;

class User extends Model{
    static properties = {
        username: {unique: true, required: true},
        name: {required: true},
        password: {required: true, protected: true},
        roles: {options: ["Admin"]}
    }
    
    async getRoles(){
        return this.roles;
    }
};

module.exports = User;