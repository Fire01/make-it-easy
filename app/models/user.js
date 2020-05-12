const Model = require("make-it-easy").model;

class User extends Model{
    // V12
    /*
    static properties = {
        username: {unique: true, required: true},
        name: {required: true},
        password: {required: true, protected: true},
        roles: {options: ["Admin"]}
    }
    */
    
    async getRoles(){
        return this.roles;
    }
};

// V10 or higher
User.properties = {
    username: {unique: true, required: true},
    name: {required: true},
    password: {required: true, protected: true},
    roles: {options: ["Admin"]}
}

module.exports = User;