const fs = require("fs");
const copy = require('recursive-copy');
const path = require('path');
const envfile = require('envfile');
const destPath = process.env.INIT_CWD;
const envSource = path.join(destPath, '.env');
const uuid = require("uuid");

if(__dirname === destPath) return false;

fs.open(envSource, 'r', function (err, fd) {
    if (err) {
        fs.writeFile(envSource, "", function (err) {
            if (err) console.log(err);
        });
    }

    let env = envfile.parseFileSync(envSource);

    env.SECRET = env.SECRET || uuid.v4();
    env.ENV = env.ENV || "development";
    env.PORT = env.PORT || 8000;
    env.TITLE = env.TITLE || "Make It Easy";

    fs.writeFileSync(envSource, envfile.stringifySync(env));
    console.info('Generates Env files');
});

copy(path.join(__dirname, '/app'), path.join(destPath, '/app'))
.then(function (results) {
    console.info('Copied ' + results.length + ' files');
})
.catch(function (error) {
    console.error('File already exist');
});