/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2016/12/29
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description
 */

var http = require('http');
var UTIL = require('./common/util');
var SRequest = require('./model/request');


var commandPrams = process.argv.splice(2);
//console.log(commandPrams);
var params = UTIL.commandLineParamsToJSON(commandPrams);
UTIL.moveProperties(params, 'resources', ['cpus', 'memoryMb', 'numPorts']);

//console.log(params);
var params = {
    id: "nodejs",
    owners: "1329555958@qq.com",
    uris: "hdfs://10.5.16.14:9000/mesos/mesos-2.0.0.jar",
    command: "java -jar -Dserver.port=$PORT0 -Dserver.context-path=/nodejs mesos-2.0.0.jar",
    healthcheckUri: "/nodejs/hello",
    serviceBasePath: "/nodejs",
    loadBalancerGroups: "testGroup"
};
SRequest.createRequest(params);

