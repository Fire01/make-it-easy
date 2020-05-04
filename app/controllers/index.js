const Controller = require('make-it-easy').controller;

module.exports = [
    new Controller({
        name: 'index',
        path: '/',
        method: 'GET',
        acl: '*',
        fn: (req, res) => {
            return res.render('_base/main', {
                homePath: '/users',
                user: req.session.user,
                menu: [
                    {text: "Home", icon: "home", location: "/", target: "_self"},
                    {text: "Users", icon: "user", route: "view_users"},
                ]                
            });
        }
    })
];