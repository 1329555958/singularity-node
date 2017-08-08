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
var _ = require('lodash');
var assert = require('assert');
var $ = require('request');
var CONFIG = require("../common/config").config;
var UTIL = require('../common/util');
var fs = require("fs");
/**
 * 默认发布模型
 * @returns {{requestId: string, id: string, command: string, resources: {numPorts: number}, uris: Array, healthcheckUri: string, serviceBasePath: string, loadBalancerGroups: Array, healthcheckProtocol: string}}
 */
function defaultModel(params) {
    return _.defaultsDeep({}, params, {
        "requestId": "singularity-test-service",
        "id": '',
        "command": "./start.sh",
        containerInfo: {
            type: "DOCKER",
            docker: {
                image: UTIL.getDockerImageName(CONFIG.dockerRegistryUri, CONFIG.dockerImage),
                privileged: true,
                network: "BRIDGE",
                portMappings: [
                    {
                        containerPortType: "LITERAL",
                        containerPort: 8080,
                        hostPortType: "FROM_OFFER",
                        hostPort: 0,
                        protocol: "tcp"
                    }
                ],
                forcePullImage: false,
                parameters: {"add-host": CONFIG.addHost || "localhost:127.0.0.1"}
            }
        },
        env: {
            //SHELL_PATH: "run.sh"
        },
        "resources": {
            "cpus": 0.1,
            "memoryMb": CONFIG.memoryMb,
            "numPorts": 1,
            "diskMb": 0
        },
        "uris": [],
        healthcheckUri: '',
        serviceBasePath: '',
        loadBalancerGroups: [],
        loadBalancerOptions: {},
        healthcheckProtocol: 'HTTP'
    });
}
/**
 * 新建一个发布模型
 * @param params {{id: string, command: string, resources: {numPorts: number}, uris: String, healthcheckUri: string, serviceBasePath: string, loadBalancerGroups: String}}
 * @returns {{deploy}}
 */
function newDeployModel(params) {
    assert(params, "参数不可为空");

    var model = defaultModel(params);
    var now = new Date();
    var id = params.buildId || UTIL.dateUtil.format(now, 'hh.mm.ss');
    model.requestId = model.id;
    model.id = id;
    if (!_.isArray(model.uris)) {
        model.uris = model.uris.split(',');
    }
    if (!_.isArray(model.loadBalancerGroups)) {
        model.loadBalancerGroups = model.loadBalancerGroups.split(",");
    }
    if (model.containerType && model.containerType.toLowerCase() !== 'docker') {
        delete  model.containerInfo;
    }
    if (params.dockerEnv) {
        _.extend(model.env, params.dockerEnv);
    }
    if (params.loadBalancerOptions) {
        _.extend(model.loadBalancerOptions, params.loadBalancerOptions);
    }
    if (params.dockerImage) {
        _.set(model, 'containerInfo.docker.image', params.dockerImage);
        //如果是ttserver 就需要读取配置文件
        if (params.dockerImage.indexOf('ttserver') > -1) {
            var path = params.dockerEnv.GIT_NAME + "/" + params.dockerEnv.INSTANCE_CMD + ".txt";
            var data = fs.readFileSync(path.replace(/\/\//g, "\/"));
            var keystr = data.toString().replace(/\s+/g, ";").replace(/;+/g, ";").replace(/;$/, "").replace(/^;/, "");
            model.env.KEY_STR = keystr;
            model.resources.numPorts = keystr.split(";").length + 1;
        } else if (params.dockerImage.indexOf('activemq') > -1) {
            //activemq 映射8161  61616端口
            var portMap = {
                containerPortType: "LITERAL",
                containerPort: 8161,
                hostPortType: "LITERAL",
                hostPort: 8161,
                protocol: "tcp"
            };
            model.containerInfo.docker.portMappings.push(portMap);
            portMap = {
                containerPortType: "LITERAL",
                containerPort: 61616,
                hostPortType: "LITERAL",
                hostPort: 61616,
                protocol: "tcp"
            };
            model.containerInfo.docker.portMappings.push(portMap);

        }

    }

    if (model.resources.numPorts - 1 > 0) {
        var numPorts = model.resources.numPorts - 0;
        for (var i = 1; i < numPorts; i++) {
            var portMap = {
                containerPortType: "LITERAL",
                containerPort: 8080 + i,
                hostPortType: "FROM_OFFER",
                hostPort: i,
                protocol: "tcp"
            };
            model.containerInfo.docker.portMappings.push(portMap);
        }
    }
    assert(model.id, UTIL.formatString("id是必须的,params={}", params));
    assert(model.uris, UTIL.formatString("uris是必须的,params={}", params));
    assert(model.command, UTIL.formatString("command是必须的,params={}", params));
    assert(model.healthcheckUri, UTIL.formatString("healthcheckUri是必须的,params={}", params));
    assert(model.serviceBasePath, UTIL.formatString("serviceBasePath是必须的,params={}", params));
    //assert(model.loadBalancerGroups, UTIL.formatString("loadBalancerGroups是必须的,params={}", params));
    return {"deploy": model};
}
/**
 * 新增一个发布
 * @param params {{id,owners,instances}|{id:string,owners:string[],instances:number,command: string, resources: {numPorts: number}, uris: String, healthcheckUri: string, serviceBasePath: string, loadBalancerGroups: String}}
 */
function createDeploy(params) {
    setTimeout(function () {
        var model = newDeployModel(params);
        //console.log(JSON.stringify(model));
        $.post(CONFIG.singularityUrl + '/api/deploys', {
            json: model
        }, function (err, resp, body) {
            assert(!err, UTIL.formatString("创建发布时出现异常,err={},params={}", err, model));
            assert(resp.statusCode >= 200 && resp.statusCode <= 299, UTIL.formatString("未成功创建发布,{},参数={}", body, model));
            console.log("发布中...");
            waitForDeployResult(model.deploy.requestId, model.deploy.id);
        });
    }, 1000);
}
/**
 * 查询发布结果
 * @param requestId {string} 请求编号
 * @param deployId {string} 发布编号
 */
function waitForDeployResult(requestId, deployId) {
    //先去查询请求信息
    setTimeout(function () {
        $.get(CONFIG.singularityUrl + '/api/requests/request/' + requestId, function (err, resp, body) {
            var body = JSON.parse(body);
            if (body) {
                var id = '';
                if (body.requestDeployState.pendingDeploy) {
                    id = body.requestDeployState.pendingDeploy.deployId;
                    //还在发布，重新查询
                    if (id == deployId) {
                        waitForDeployResult(requestId, deployId);
                    }
                } else if (body.requestDeployState.activeDeploy) {
                    id = body.requestDeployState.activeDeploy.deployId;
                    if (id == deployId) {
                        //发布成功成功
                        console.log(UTIL.formatString("发布成功,{}   ;requestId={},deployId={}", CONFIG.singularityUrl + '/request/' + requestId, requestId, deployId));
                    } else {
                        queryTaskHistory(requestId, deployId, 5);
                    }
                } else { //发布失败，去查询发布历史
                    queryTaskHistory(requestId, deployId, 5);
                }
            }
        });
    }, 1000);
}
/**
 * 查询发布历史数据，用来查看发布错误信息
 * @param requestId
 * @param deployId
 * @param loopNum 循环次数，有可能一次查不到数据
 */
function queryTaskHistory(requestId, deployId, loopNum) {
    //查询对应的具体的发布编号
    setTimeout(function () {
        $.get(CONFIG.singularityUrl + '/api/history/request/' + requestId + '/tasks?requestId=' + requestId + '&deployId=' + deployId + '&count=1&page=1', function (err, resp, body) {
            var body = JSON.parse(body);
            //发布失败
            console.log(body[0]);
            if (!body[0] && loopNum-- > 0) {
                queryTaskHistory(requestId, deployId, loopNum);
                console.log("未查询到失败信息,继续查询..." + loopNum);
                return;
            }
            assert(deployId == body[0].taskId.deployId, "发布失败,原因未知!");
            //获取发布详情
            var taskId = body[0].taskId.id;
            $.get(CONFIG.singularityUrl + '/api/history/task/' + taskId, function (err, resp, body) {
                var body = JSON.parse(body);
                var result = body.taskUpdates[body.taskUpdates.length - 1];
                console.log(UTIL.formatString("发布结果:详情={}  ,请求编号={},发布编号={},任务编号={},状态={},原因={}", CONFIG.singularityUrl + '/task/' + taskId, requestId, deployId, taskId, result.taskState, result.statusMessage));
            });
        });
    }, 2000);
}

exports.createDeploy = createDeploy;