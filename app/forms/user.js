const Form = require("make-it-easy").form;
const User = require("../models/user");
const bcrypt = require('bcryptjs');

module.exports = new Form(User, {
    name: 'form_user',
    path: '/user',
    acl: '*',
    items: {
        username: { unique: true, required: true },
        name: { required: true },
        password: {type: 'password', required: true},
        roles: { type: 'select', multiple: true }
    },
    beforeSave: async (args) => {
        if (args.doc.password) {
            const hash = await bcrypt.hashSync(args.doc.password, 10);
            args.doc.password = hash;
        } else {
            args.doc.password = args.prevDoc.password;
        }
    },
    beforeOpen: async (args) => {
        args.items.password.hide = !args.editMode;
        args.items.password.required = args.editMode && !args.data._id ? true : false;
        args.data.password = "";
    }
});