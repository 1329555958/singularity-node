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
console.log(commandPrams);
var params = UTIL.commandLineParamsToJSON(commandPrams);

//id=test.${JOB_NAME} owners=1329555958@qq.com instances=1 command="java  -jar -Dserver.port=\$PORT0 -Dserver.context-path=/${JOB_NAME} mesos.jar" uris=hdfs://10.5.16.14:9000/mesos/mesos.jar healthcheckUri=/${JOB_NAME}/hello serviceBasePath=/${JOB_NAME} loadBalancerGroups=testGroup
/*
 app  必须;例如cas-web;应用名称
 envInfo 可选;例如func111;环境信息
 id   可选;例如cas-web;全局唯一标识，如果不指定，默认会使用{envInfo}.{app}的组合
 buildId 可选;例如1,m用来标识发布;Jenkins可以使用${BUILD_ID},不指定时默认使用hh.mm.ss格式化当前日期
 owners 可选;例如weichunhe@netfinworks.com;拥有者的邮箱，多个之间用逗号分隔，用于部署伸缩或者被kill时发送邮件进行提醒
 instances 可选;默认1;需要部署的实例个数
 numPorts 可选;默认1; 每个实例需要使用的端口个数
 command 可选;例如"java  -jar -Dserver.port=\$PORT0 -Dserver.context-path=/cas-web mesos.jar";shell命令，如果命令中有空格需要使用双引号。$PORT0表示第一个端口，$需要使用\进行转义，如果使用非docker容器就必须指定
 uris 必须;例如hdfs://10.5.16.14:9000/mesos/mesos.jar,https://github.com/1329555958/ui/releases/download/1.0/singularity_example.yml; 应用包的地址，可以是http的也可以是hdfs的，多个之间使用逗号分隔
 healthcheckUri 可选;例如/cas-web/healthCheck;健康检查地址，如果不指定时，默认使用/{app}/_health_check
 serviceBasePath 可选;例如/cas-web;负载均衡的前置地址，如果不指定时，默认使用/{app}
 loadBalancerGroups 必须;例如testGroup;负载均衡分组地址，这个需要在安装负载均衡器(baragon agent)时指定的
 containerType 可选;默认docker；可选(docker、mesos)；使用docker作为容器，mesos使用默认容器
 */


//对参数进行处理
//envInfo.app 组合成id
if (!params.id && params.app) {
    params.id = params.app;
    if (params.envInfo) {
        params.id = params.envInfo + "." + params.id;
    }
}
//healthcheckUri
if (!params.healthcheckUri) {
    params.healthcheckUri = "/" + params.app + "/_health_check";
}
//serviceBasePath
if (!params.serviceBasePath) {
    params.serviceBasePath = "/" + params.app;
}


UTIL.moveProperties(params, 'resources', ['cpus', 'memoryMb', 'numPorts']);

console.log(params);
var params = {
    buildId: 'webstorm.' + new Date().getTime(),
    app: 'optimus',
    envInfo: 'test',
    owners: '1329555958@qq.com',
    command: './call.sh',
    uris: 'hdfs://10.5.16.14:9000/mesos/var/lib/jenkins/jobs/optimus/workspace/optimus-h5.war,hdfs://10.5.16.14:9000/mesos/var/lib/jenkins/jobs/optimus/workspace/optimus-admin.war,hdfs://10.5.16.14:9000/mesos/run.sh,hdfs://10.5.16.14:9000/mesos/app.properties',
    healthcheckUri: '/optimus-h5/_health_check',
    loadBalancerGroups: 'testGroup',
    rackAffinity: 'DOCKER',
    id: 'test.optimus',
    serviceBasePath: '/optimus',
    skipHealthchecksOnDeploy:true,
    resources: {}
};
SRequest.createRequest(params);


//sh /opt/applications/env_scm_tools/scm_tools/tomcat/createTomcatInstance.sh $INSTANCE_NAME $ENV_INFO $INSTANCE_CMD $PORT $GIT_NAME $APP $TOMCAT_VERSION TYPE

//id=jenkins22 owners='1329555958@qq.com' command="java  -jar -Dserver.port=\$PORT0 -Dserver.context-path=/jenkins22 mesos-2.0.0.jar" uris='hdfs://10.5.16.14:9000/mesos/mesos-2.0.0.jar' healthcheckUri='/jenkins22/hello' serviceBasePath='/jenkins22' loadBalancerGroups='testGroup'