const bcrypt = require('bcryptjs');
const User = require("../models/user");
const Controller = require('make-it-easy').controller;

module.exports = [
    new Controller({
        name: 'login',
        path: '/login',
        method: ['GET', 'POST'],
        csrf: true,
        async fn(req, res, next){
            if(req.method === 'POST'){
                const {username, password} = req.body;
                const user = await User.findOne({username: new RegExp("^" + username.toLowerCase(), "i")});
                if(user){
                    const checkPassword = await bcrypt.compare(password, user.password);
                    if(checkPassword){
                        if(!res.local) res.local = {};
                        let sesUser = Object.assign({}, user.get());
                        let roles = await user.getRoles();
                        sesUser.roles = Array.isArray(roles) ? roles : [roles];
                        req.session.user = sesUser;
                        
                        return res.redirect('/');
                    }
                }

                return res.render('_base/login', {csrfToken: req.csrfToken(), error: "Username or Password is incorrect!", username: req.body.username});
            }else{
                if(req.session.user) return res.redirect('/');
                else return res.render('_base/login', {csrfToken: req.csrfToken()});
            }
        }
    }),

    new Controller({
        name: 'logout',
        path: '/logout',
        method: 'GET',
        acl: '@',
        fn: (req, res) => {
            req.session.destroy(() => {});
            return res.redirect('/');
        }
    }),
];