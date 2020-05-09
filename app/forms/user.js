const Form = require("make-it-easy").form;
const User = require("../models/user");
const bcrypt = require('bcryptjs');

module.exports = new Form(User, {
    name: 'form_user',
    path: '/user',
    acl: 'Admin',
    items: {
        username: { unique: true, required: true },
        name: { required: true },
        password: {type: 'password', required: true},
        roles: { type: 'select', multiple: true }
    },
    beforeSave: async (doc, prevDoc) => {
        if (doc.password) {
            const hash = await bcrypt.hashSync(doc.password, 10);
            doc.password = hash;
        } else {
            doc.password = prevDoc.password;
        }
    },
    beforeOpen: async (properties, data, editMode) => {
        properties.password.hide = !editMode;
        properties.password.required = editMode && !data._id ? true : false;
        data.password = "";
    }
});