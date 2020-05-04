const View = require("make-it-easy").view;
const User = require("../models/user");
const FormUser = require("../forms/user");

module.exports = new View(User, {
    name: 'view_users',
    path: '/users',
    form: FormUser,
    acl: '*',
    column: [
        {data: 'name'},
        {data: 'username'},
        {data: 'roles'}
    ],
});