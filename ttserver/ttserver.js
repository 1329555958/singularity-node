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
    fs.writeFileSync(RunShellFile, shell);
}

loadConf();
findAvailablePorts(function (ports) {
    assignPorts(ports);
    saveRunShell();
    saveConf();
    console.log('inited');
});

//docker run -e MESOS_SANDBOX=/mnt/mesos/sandbox -e ENV_INFO=func124 -e INSTANCE_NAME=ttserver -e KEY_STR="index.com.netfinworks.cache.cc;index.com.netfinworks.ma.cache;index.com.netfinworks.dpm;index.com.netfinworks.cmf.channelintegration" --net host -it ttserver bash