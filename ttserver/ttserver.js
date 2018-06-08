var portastic = require('portastic');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Exec = require('child_process').exec;

var RootDir = '/ttserver';
var App = process.env.ENV_INFO + '.' + process.env.INSTANCE_NAME;
var ConfigFile = path.resolve(RootDir, App);
var RunShellFile = '/opt/ttserver.sh';
//memcached key string
var McKeyStr = process.env.KEY_STR;

var compileRunShell = _.template(fs.readFileSync(path.resolve(__dirname, 'run.txt')));

/**
 * {key:port}
 * @type {{}}
 */
var LastConfig = {};

var TtserverPort = 0;
/**
 * [{
 * key:
 * port:
 * }]
 * @type {Array}
 */
var McKeyPorts = [];

/**
 * callback(availablePorts)
 * @param callback
 */
function findAvailablePorts(callback) {
    portastic.find({
        min: 50000,
        max: 51000
    }).then(function (ports) {
        callback(ports);
    });
}

function loadConf() {
    if (!fs.existsSync(ConfigFile)) {
        return;
    }
    var content = new String(fs.readFileSync(ConfigFile)).replace('\r', '');
    var lines = content.split('\n');
    lines.forEach(line=> {
        if (!line || !line.trim()) {
            return;
        }
        line = line.trim();
        var kv = line.split(':');
        if (kv[1]) {
            LastConfig[kv[0]] = kv[1];
        }
    });
}

function saveConf() {
    var config = [];
    config.push(App + ':' + TtserverPort);
    McKeyPorts.forEach(keyPort=> {
        config.push(keyPort.key + ':' + keyPort.port);
    });
    fs.writeFile(ConfigFile, config.join('\r\n'));
}

function assignPorts(availablePorts) {
    var McKeys = McKeyStr.split(';');
    TtserverPort = LastConfig[App] || availablePorts[0];
    for (var i = 0; i < McKeys.length; i++) {
        var key = McKeys[i];
        var port = LastConfig[key] || availablePorts[i + 1];
        console.assert(port, 'no more ports can available.');
        McKeyPorts.push({key: key, port: port});
    }
}

function saveRunShell() {
    var shell = compileRunShell({ttserverPort: TtserverPort, mcKeyPorts: McKeyPorts});
    console.log(shell);
    fs.writeFileSync(RunShellFile, shell);
    var cmd = 'sh ' + RunShellFile;
    console.log(cmd);
    Exec(cmd, function (err, stdout, stderr) {
        err && console.log(err);
    });
}

loadConf();
findAvailablePorts(function (ports) {
    assignPorts(ports);
    saveRunShell();
    saveConf();
    console.log('finished');
});