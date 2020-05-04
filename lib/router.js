const express = require('express');
const router = express.Router();
const fs = require("fs");
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const bodyParser = require('body-parser');
const parseForm = bodyParser.urlencoded({ extended: false });

//-------------------------------------------- Loader Controllers --------------------------------------------
fs.readdirSync(Utils.configs.controllers).forEach(function(file) {
    let content = require(Utils.configs.controllers + '/' + file); 
    let items = Array.isArray(content) ? content : [content];
    items.forEach(el => {
        if(Object.getPrototypeOf(el).constructor.name === 'Controller'){
            if(Utils.routes[el.name]){
                console.log("\x1b[31m%s\x1b[0m", `Controller "${el.name}" already exist!`);
                process.exit(1);
            }
            
            let methods = Array.isArray(el.method) ? el.method : [el.method];
            methods.forEach(method => {
                switch(method.toUpperCase()){
                    case 'POST':
                        if(el.csrf) router.post(el.path, parseForm, csrfProtection, (req, res, next) => el.init(req, res, next)); 
                        else router.post(el.path, (req, res, next) => el.init(req, res, next));
                        break;
                    default:
                        if(el.csrf) router.get(el.path, csrfProtection, (req, res, next) => el.init(req, res, next));
                        else router.get(el.path, (req, res, next) => el.init(req, res, next)); 
                        break;
                }
            });
            
            Utils.routes[el.name] = {type: "Controller", name: el.name, path: el.path, method: methods.map(m => m.toUpperCase()).join("|")}
        }
    });
});

//-------------------------------------------- Loader Views --------------------------------------------
fs.readdirSync(Utils.configs.views).forEach(function(file) {
    let content = require(Utils.configs.views + '/' + file); 
    let items = Array.isArray(content) ? content : [content];
    items.forEach(el => {
        if(Object.getPrototypeOf(el).constructor.name === 'View'){
            if(Utils.routes[el.name]){
                console.log("\x1b[31m%s\x1b[0m", `View "${el.name}" already exist!`);
                process.exit(1);
            }
    
            router.get(el.path, (req, res, next) => el.init(req, res, next)); 
            Utils.routes[el.name] = {type: "View", name: el.name, path: el.path, method: "GET"}
        }
    });
});

//-------------------------------------------- Loader Forms --------------------------------------------
fs.readdirSync(Utils.configs.forms).forEach(function(file) {
    let content = require(Utils.configs.forms + '/' + file); 
    let items = Array.isArray(content) ? content : [content];
    items.forEach(el => {
        if(Object.getPrototypeOf(el).constructor.name === 'Form'){
            if(Utils.routes[el.name]){
                console.log("\x1b[31m%s\x1b[0m", `View "${el.name}" already exist!`);
                process.exit(1);
            }
            
            router.route(el.path)
                .get(csrfProtection, (req, res, next) => el.init(req, res, next))
                .post(parseForm, csrfProtection, (req, res, next) => el.init(req, res, next))
                .delete((req, res, next) => el.init(req, res, next)); 

                Utils.routes[el.name] = {type: "Form", name: el.name, path: el.path, method: "GET|POST"}
        }
    });
});

module.exports = router;