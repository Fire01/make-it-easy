const fs = require("fs");
const copy = require('recursive-copy');
const path = require('path');
const envfile = require('envfile');
const destPath = process.env.INIT_CWD;
const envSource = path.join(destPath, '.env');
const uuid = require("uuid");

if(__dirname === destPath) return false;

copy(path.join(__dirname, '/app'), path.join(destPath, '/app')).then(function (results) {
    console.log("\x1b[42m", `Copy assets ${results.length} files`, "\x1b[0m");
}).catch(err => {});

fs.open(envSource, 'r', function (err, fd) {
    if (err) {
        fs.writeFile(envSource, "", function (err) {
            if (err) console.log(err);
            else generateEnv();
        });
    }else{
        generateEnv();
    }
});

function generateEnv(){
    let env = envfile.parseFileSync(envSource);

    env.SECRET = env.SECRET || uuid.v4();
    env.ENV = env.ENV || "development";
    env.PORT = env.PORT || 8000;
    env.TITLE = env.TITLE || "Make It Easy";

    fs.writeFileSync(envSource, envfile.stringifySync(env));
    if(!env.SECRET || !env.ENV || !env.PORT || !env.TITLE) console.log("\x1b[42m", `Generates Configurations`, "\x1b[0m");
}