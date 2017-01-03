
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
var UTIL =  require('./common/util');
var SRequest = require('./model/request');


var commandPrams = process.argv.splice(2);
console.log(commandPrams);
var params = UTIL.commandLineParamsToJSON(commandPrams);
UTIL.moveProperties(params, 'resources', ['cpus', 'memoryMb', 'numPorts']);
console.log(params);
//var params = {
//    id: "jenkins22",
//    owners: "1329555958@qq.com",
//    uris: "hdfs://10.5.16.14:9000/mesos/mesos-2.0.0.jar",
//    command: "java -jar -Dserver.port=$PORT0 -Dserver.context-path=/jenkins22 mesos-2.0.0.jar",
//    healthcheckUri: "/jenkins22/hello",
//    serviceBasePath: "/jenkins22",
//    loadBalancerGroups: "testGroup"
//};
SRequest.createRequest(params);



//id=jenkins22 owners='1329555958@qq.com' command="java  -jar -Dserver.port=\$PORT0 -Dserver.context-path=/jenkins22 mesos-2.0.0.jar" uris='hdfs://10.5.16.14:9000/mesos/mesos-2.0.0.jar' healthcheckUri='/jenkins22/hello' serviceBasePath='/jenkins22' loadBalancerGroups='testGroup'