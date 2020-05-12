# Make It Easy
Express based with prebuilt nedb as database, fomantic/semantic ui as user interface and use DataTables to display the data. 
Come with concept Controller, Form and View(not view like ejs, twig and others, its view to display the data).

Just some experiment, never tested in production. Support node.js v10.


## Installation

```sh
npm install make-it-easy
```
After installation you will see prebuilt source in folder `app`

    app
    ├── controllers     # Controller files
    ├── forms           # Form files
    ├── models          # Model files
    ├── templates       # Template files(View engine using twigjs)
    └── views           # View files

## Usage

```js
const MIE = require('make-it-easy');

let app = new MIE();
app.start();
```

# API
Maybe not all api described here, doc need to be updated.


## Model
Curently avaiable only for nedb model
```js
const Model = require("make-it-easy").model;

class User extends Model{
    // V12 or higher
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
```
### Options
* **tableName**: (string) name for table. one model save in one db (optional, default to class name)
* **timestamp**: (boolean) options to create attribute `_created` and `_updated` (optional, default to true)
* **properties**: (object) list of model properties. some of options not implemented yet like `unique` and some other can be loaded for form options
    * **required**: (boolean) requires options, if its set to `true` but the attribute not set, when save the model it will fail.
* **beforeSave**: (function) event before save data to database, has parameter `args`
* **save**: (method) save data to database
* **afterSave**: (function) event after save data to database, has parameter `args`
* [static]**find**: (method) function for find document. return array objct. params:
    * **conditions**: (object) condition/option to find doc using nedb (optional)
    * **limit**: (number) condition/option to find doc using nedb (optional, default to 0/unlimited)
    * **sort**: (object) sorting documents (optional)
* [static]**findById**(id): (method) find one document using id.
* [static]**findOne**(conditions): (method) find one document using conditions.
* [static]**removeById**(id): (method) remove document using id.



## Controller
Put files in folder `app/controllers`, then it will be loaded automatically
```js
const Controller = require('make-it-easy').controller;

module.exports = [
    new Controller({
        name: 'index',
        path: '/',
        method: 'GET',
        acl: '*',
        fn: (req, res, next) => {
            return res.json({success: true});
        }
    })
];
```

### Options
* **name**: (string) unique. used in template to get route using `route(route_name)` (required)
* **path**: (string) route path (required)
* **method**: (string|array) request method. If multiple, use array `method: ['GET', 'POST']` (required)
* **acl**: (string|array) access controll list. If multiple use array  `acl: ['@', 'Admin']`. Avaiable acl options: (optional, default to `*`)
    * `*` for all users (guest|authenticated)
    * `@` for authenticated only and 
    * `text` for roles
* **fn**: (function) controller function, has `req`, `res` and `next` params (required)
* **csrf**: (boolean) if you want to use [csurf](https://github.com/expressjs/csurf) for get and post (optional, default to `false`)



## Form
Put files in folder `app/forms`, then it will be loaded automatically
```js
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
```
### Options
* **model**: (model) reference model for the form
* **option**: (object) form options
    * **name**: (string) unique. used in template to get route using `route(route_name)` (required)
    * **path**: (string) route path (required)
    * **acl**: (string|array) access controll list. If multiple use array  `acl: ['@', 'Admin']`. Avaiable acl options: (optional, default to `*`)
        * `*` for all users (guest|authenticated)
        * `@` for authenticated only and 
        * `text` for roles
    * **items**: Form items
        * **required**: (function|boolean) items required option, validation using bacis html form validation
        * **type**: (string) items type. Currently only support:
            * `text`
            * `number`
            * `textarea`
            * `date`
            * `time`
            * `select`
            * `radio`
            * `checkbox`
            *  `toggle`
            * `computed`
            * `items` (like level 2 of form items, must have attribute form items)
    * **readers**: (function|boolean) function to determine can access the form or not
    * **authors**: (function|boolean) function to determine can save/edit/remove the form or not
    * **javascripts**: (string|array) add js files to the form (relative path)
    * **styles**: (string|array) add css files to the form (relative path)
    * **variables**: (object) add variables to the form with name `vars`. (can be string, object, array, function or async function)
    * **beforeOpen**: (function) event before open the document
    * **beforeSave**: (function) event before save the document
    * **afterSave**: (function) event after save the document



## View
Put files in folder `app/views`, then it will be loaded automatically
```js
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
```
### Options
* **model**: (model) reference model for the form
* **option**: (object) view options
    * **name**: (string) unique. used in template to get route using `route(route_name)` (required)
    * **path**: (string) route path (required)
    * **form**: (Form) form reference to open the form
    * **acl**: (string|array) access controll list. If multiple use array  `acl: ['@', 'Admin']`. Avaiable acl options: (optional, default to `*`)
        * `*` for all users (guest|authenticated)
        * `@` for authenticated only and 
        * `text` for roles
    * **column**: Column list you want to display in view.
        * **data**: (string) attributes from model
        * **type**: (string) currently only support `date`, `datetime`
        * **title**: (string) header title
        * **render**: (function) render function, has parameter `col` and `rows`
    * **readers**: (function|boolean) function to determine can access the form or not
    * **conditions**: (object|nedb condition) condition to filter view



# Contributing
1. Fork it
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

# Lisence
MIT