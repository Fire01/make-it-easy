const Form = require("make-it-easy").form;
const User = require("../models/user");
const bcrypt = require('bcryptjs');
const createError = require('http-errors');

module.exports = new Form(null, {
    name: 'form_change_password',
    title: 'Change Password',
    path: '/change-password',
    acl: '@',
    csrf: false,
    items: {
        current: {type: 'password', required: true},
        new_password: {type: 'password', required: true},
        confirm_password: {type: 'password', required: true},
    },
    callback: async(req, res, next, self) => {
        if(!req.session.user) return next(createError(401, 'Please login to view this page.'));
        let data = req.body['form_change_password'];
        
        const user = await User.findById(req.session.user._id);
        const checkPassword = await bcrypt.compare(data.current, user.password);
        let errors = [];

        if(!checkPassword) errors.push({message: "Current Password is incorrect!"});
        if(data.new_password !== data.confirm_password) errors.push({message: "New Password and Confirm Password doesn't match!"});

        if(errors.length) return res.render('_base/form', {form: self.getFormConfig(), errors: errors});

        const hash = await bcrypt.hashSync(data.new_password, 10);
        user.password = hash;
        user.save();

        req.session.destroy(() => {});
        return res.redirect('/');
    }
});