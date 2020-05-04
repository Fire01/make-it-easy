require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const Twig = require('twig');
const session = require('express-session');
const NedbSessionStore = require('nedb-session-store')(session);
const minifyHTML = require('express-minify-html');
const express = require('express');
const http = require('http');
Utils = require('./lib/utils');

class MIE {

    configs = Utils.configs;
    static controller = require('./lib/controller');
    static view = require('./lib/view');
    static form = require('./lib/form');
    static model = require('./lib/model');

    constructor() {
        this.app = express();
        this.app.set('env', process.env.ENV || 'development');
        Object.keys(Utils.configs).forEach(el => this.app.locals[el] = Utils.configs[el]);
        Object.keys(Utils.twig).forEach(el => Twig.extendFunction(el, Utils.twig[el]));

        this.app.use(logger('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(session({
            secret: process.env.SECRET,
            resave: true,
            saveUninitialized: false,
            cookie: { secure: false, maxAge: 7 * 24 * 3600 * 1000 },
            store: new NedbSessionStore({filename: path.join(process.cwd(), 'database/session.db')})
        }));

        this.app.use(express.static(path.join(__dirname, '/resources/public')));

        if (process.env.ENV == 'production') this.app.use(
            minifyHTML({
                override: true,
                exception_url: false,
                htmlMinifier: {
                    removeComments: true,
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeEmptyAttributes: true,
                    minifyJS: true
                }
            })
        );
    }

    config(args) {
        if (args.controllers) this.configs.controllers = args.controllers;
        if (args.forms) this.configs.forms = args.forms;
        if (args.views) this.configs.views = args.views;
        if (args.templates) this.configs.templates = args.templates;
        if (args.public) this.configs.public = args.public;
    }

    start(port) {
        if (!this.configs.controllers) this.configs.controllers = path.join(process.cwd(), "/app/controllers");
        if (!this.configs.forms) this.configs.forms = path.join(process.cwd(), "/app/forms");
        if (!this.configs.views) this.configs.views = path.join(process.cwd(), "/app/views");
        if (!this.configs.templates) this.configs.templates = path.join(process.cwd(), "/app/templates");

        if (this.configs.public) this.app.use(express.static(Utils.configs.public));
        this.app.use(require('./lib/router'));
        this.app.set('views', Utils.configs.templates);
        this.app.set('view engine', 'twig');

        this.server = http.createServer(this.app);

        port = this.normalizePort(port || process.env.PORT || 3000);
        this.app.set('port', port);

        this.server.listen(port);
        this.server.on('listening', () => this.listen());
        this.server.on('error', this.onError);

        this.app.use(function (req, res, next) {
            let err = new Error(`${req.method} "${req.path}" was not found on this server!`);
            err.status = 404;
            return next(err);
        });

        this.app.use(function (err, req, res, next) {
            let status = err.status || 500;
            res.status(status);
            return res.render('_base/error', {
                status: status,
                message: err.message,
                error: process.env.ENV === 'production' ? {} : err
            });
        });
    }

    listen(callback) {
        let addr = this.server.address();
        let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        console.log("\x1b[42m", `================= Listening on ${bind} =================`, "\x1b[0m");
        if (callback && typeof callback === "function") callback();
    }

    normalizePort(val) {
        let port = parseInt(val, 10);
        if (isNaN(port)) return val;
        if (port >= 0) return port;
        return false;
    }

    onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        let bind = typeof app.get('port') === 'string' ? 'Pipe ' + app.get('port') : 'Port ' + app.get('port');
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}

module.exports = MIE;