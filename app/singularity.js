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
var config = require('./common/config').config;
var assert = require('assert');
var _ = require('lodash');

function processCmdParam() {
    var commandPrams = process.argv.splice(2);
    console.log('command line params:', commandPrams);
    var params = UTIL.commandLineParamsToJSON(commandPrams);
    return params;
}

// "INSTANCE_NAME=ues-ws" "ENV_INFO=func111docker" "CONTEXT_NAME=ues-ws"  "GIT_NAME=fj338_ues-ws"  "INSTANCE_CMD=fj338_ues-ws_func111_build_20161216.1"  【DOMAIN=】
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
 loadBalanced 可选;true or false 默认true ;是否进行负载均衡
 loadBalancerGroups 必须;例如testGroup;负载均衡分组地址，这个需要在安装负载均衡器(baragon agent)时指定的
 containerType 可选;默认docker；可选(docker、mesos)；使用docker作为容器，mesos使用默认容器
 skipHealthchecksOnDeploy 可选;默认false；部署时是否进行健康检查
 */
function singularity(params) {
//对参数进行处理

    assert(params.INSTANCE_NAME, UTIL.formatString("INSTANCE_NAME是必须的,params={}", params));
    assert(params.ENV_INFO, UTIL.formatString("ENV_INFO是必须的,params={}", params));
    assert(params.CONTEXT_NAME, UTIL.formatString("CONTEXT_NAME是必须的,params={}", params));
    assert(params.GIT_NAME, UTIL.formatString("GIT_NAME是必须的,params={}", params));
    assert(params.INSTANCE_CMD, UTIL.formatString("INSTANCE_CMD是必须的,params={}", params));


//docker 环境参数 -e
    var dockerEnv = _.extend({}, params);

    dockerEnv.BEFORE_CMD = "";
    //"eval echo 10.65.215.31 vfintra1.hdfs.cn >> /etc/hosts" +
    //"&& eval echo 10.65.215.34 dev21534 vfintra4.hdfs.cn  >> /etc/hosts" +
    //"&& eval echo 10.65.215.33 dev21533 vfintra3.hdfs.cn  >> /etc/hosts" +
    //"&& eval echo 10.65.215.32 dev21532 vfintra2.hdfs.cn  >> /etc/hosts" +
    //"&& eval echo 10.65.215.31 dev21531 vfintra1.hdfs.cn  >> /etc/hosts" +
    //"&& eval echo 10.65.215.13 dev21513 vfintra5.hdfs.cn  >> /etc/hosts";

    params.dockerEnv = dockerEnv;

    params.id = params.ENV_INFO + "." + params.INSTANCE_NAME;
    params.buildId = (params.INSTANCE_CMD + '_' + UTIL.dateUtil.format(new Date(), 'hhmmss')).replace(/-/g, '_');

    if (params.LOAD_BALANCED !== undefined) {
        params.loadBalanced = !!params.LOAD_BALANCED;
    }
//不提供域名，就不进行负载均衡
    if (!params.DOMAIN) {
        params.loadBalanced = false;
    } else {
        params.loadBalancerOptions = {domain: params.DOMAIN};
    }

//healthcheckUri
    if (!params.healthcheckUri) {
        params.healthcheckUri = "/" + params.CONTEXT_NAME + "/" + config.healthcheckUri;
    }
//serviceBasePath
    if (!params.serviceBasePath) {
        params.serviceBasePath = "/" + params.CONTEXT_NAME;
    }


    params.command = params.command || config.dockerCMD;

    params.loadBalancerGroups = params.loadBalancerGroups || config.loadBalancerGroups;

    UTIL.moveProperties(params, 'resources', ['cpus', 'memoryMb', 'numPorts']);

    console.log('json params:', params);

    SRequest.createRequest(params);
}

exports.singularity = singularity;
exports.processCmdParam = processCmdParam;

if (require.main === module) {
    var params = processCmdParam();
    singularity(params);
}

