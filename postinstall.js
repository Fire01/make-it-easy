const fs = require("fs");
const ncp = require('ncp').ncp;
const path = require('path');
const envfile = require('envfile');
const sourcePath = path.join(__dirname, '.env');
const uuid = require("uuid");

if(__dirname == process.cwd()) return false;

console.log("\x1b[42m", `================= Copy Default Source =================`, "\x1b[0m");

fs.open(sourcePath, 'r', function (err, fd) {
    if (err) {
        fs.writeFile(sourcePath, "", function (err) {
            if (err) console.log(err);
        });
    }

    let env = envfile.parseFileSync(sourcePath);

    env.SECRET = env.SECRET || uuid.v4();
    env.ENV = env.ENV || "development";
    env.PORT = env.PORT || 8000;
    env.TITLE = env.TITLE || "Make It Easy";

    fs.writeFileSync('./.env', envfile.stringifySync(env))
});

ncp(path.join(__dirname, '/app'), path.join(process.cwd(), '/app'), function (err) {
    if (err) return console.error(err);
    console.log("\x1b[42m", `================= Postinstall Finished =================`, "\x1b[0m");
});
