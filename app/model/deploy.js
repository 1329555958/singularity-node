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
/**
 * 默认发布模型
 * @returns {{requestId: string, id: string, command: string, resources: {numPorts: number}, uris: Array, healthcheckUri: string, serviceBasePath: string, loadBalancerGroups: Array, healthcheckProtocol: string}}
 */
function defaultModel(params) {
    return _.defaultsDeep({}, params, {
        "requestId": "singularity-test-service",
        "id": '',
        "command": "java -jar singularitytest-1.0-SNAPSHOT.jar server example.yml",
        "resources": {
            "cpus": 0.1,
            "memoryMb": 128,
            "numPorts": 1,
            "diskMb": 0
        },
        "uris": [],
        healthcheckUri: '',
        serviceBasePath: '',
        loadBalancerGroups: [],
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
    assert(params.id, UTIL.formatString("id是必须的,params={}", params));
    assert(params.uris, UTIL.formatString("uris是必须的,params={}", params));
    assert(params.command, UTIL.formatString("command是必须的,params={}", params));
    assert(params.healthcheckUri, UTIL.formatString("healthcheckUri是必须的,params={}", params));
    assert(params.serviceBasePath, UTIL.formatString("serviceBasePath是必须的,params={}", params));
    assert(params.loadBalancerGroups, UTIL.formatString("loadBalancerGroups是必须的,params={}", params));
    var model = defaultModel(params);
    var now = new Date();
    var id = UTIL.dateUtil.format(now);
    model.requestId = model.id;
    model.id = id;
    if (!_.isArray(model.uris)) {
        model.uris = model.uris.split(',');
    }
    if (!_.isArray(model.loadBalancerGroups)) {
        model.loadBalancerGroups = model.loadBalancerGroups.split(",");
    }
    return {"deploy": model};
}
/**
 * 新增一个发布
 * @param params {{id,owners,instances}|{id:string,owners:string[],instances:number,command: string, resources: {numPorts: number}, uris: String, healthcheckUri: string, serviceBasePath: string, loadBalancerGroups: String}}
 */
function createDeploy(params) {
    var model = newDeployModel(params);
    $.post(CONFIG.singularityUrl + '/api/deploys', {
        json: model
    }, function (err, resp, body) {
        assert(!err, UTIL.formatString("创建发布时出现异常,err={},params={}", err, model));
        assert(resp.statusCode >= 200 && resp.statusCode <= 299, UTIL.formatString("未成功创建发布,{},参数={}", body, model));
        console.log("发布中...");
        waitForDeployResult(model.deploy.requestId, model.deploy.id);
    });
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
                        console.log(UTIL.formatString("发布成功,requestId={},deployId={}", requestId, deployId));
                    } else {
                        queryTaskHistory(requestId, deployId);
                    }
                } else { //发布失败，去查询发布历史
                    queryTaskHistory(requestId, deployId);
                }
            }
        });
    }, 1000);
}

function queryTaskHistory(requestId, deployId) {
    //查询对应的具体的发布编号
    $.get(CONFIG.singularityUrl + '/api/history/request/' + requestId + '/tasks?requestId=' + requestId + '&deployId=' + deployId + '&count=1&page=1', function (err, resp, body) {
        var body = JSON.parse(body);
        //发布失败
        console.log(body[0]);
        assert(deployId == body[0].taskId.deployId, "发布失败,原因未知!");
        //获取发布详情
        var taskId = body[0].taskId.id;
        $.get(CONFIG.singularityUrl + '/api/history/task/' + taskId, function (err, resp, body) {
            var body = JSON.parse(body);
            var result = body.taskUpdates[body.taskUpdates.length - 1];
            assert(0, UTIL.formatString("发布结果,请求编号={},发布编号={},任务编号={},状态={},原因={}", requestId, deployId, taskId, result.taskState, result.statusMessage));
        });
    });
}

exports.createDeploy = createDeploy;