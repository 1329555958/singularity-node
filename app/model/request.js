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
var DEPLOY = require('./deploy');
/**
 * 默认请求模型
 * @returns {{id: string, requestType: string, owners: string[], instances: number, rackSensitive: boolean, loadBalanced: boolean, slavePlacement: string, emailConfigurationOverrides: {TASK_LOST: string[], TASK_KILLED: string[], TASK_FAILED: string[], TASK_KILLED_UNHEALTHY: string[]}}}
 */
function defaultModel() {
    return {
        "id": "testapi",
        "requestType": "SERVICE",
        "owners": [],//["weichunheaaaaaaa@netfinworks.com", "1329555958@qq.com"],
        "instances": 1,
        "rackSensitive": true,
        "rackAffinity": [],
        "loadBalanced": true,
        "slavePlacement": "SEPARATE",
        skipHealthchecksOnDeploy: false,
        "emailConfigurationOverrides": {
            "TASK_LOST": ["OWNERS", "ADMINS"],
            "TASK_KILLED": ["OWNERS", "ADMINS"],
            "TASK_FAILED": ["OWNERS", "ADMINS"],
            "TASK_FAILED_DECOMISSIONED": ["OWNERS", "ADMINS"],
            "TASK_KILLED_UNHEALTHY": ["OWNERS", "ADMINS"]
        }
    };
}
/**
 * 新建一个singularity的请求模型
 * @param params {{id,owners,instances}|{id:string,owners:string[],instances:number,command: string, resources: {numPorts: number}, uris: String, healthcheckUri: string, serviceBasePath: string, loadBalancerGroups: String,rackAffinity:String}}
 * @returns {{id, requestType, owners, instances, rackSensitive, loadBalanced, slavePlacement, emailConfigurationOverrides}|{id: string, requestType: string, owners: string[], instances: number, rackSensitive: boolean, loadBalanced: boolean, slavePlacement: string, emailConfigurationOverrides: {TASK_LOST: string[], TASK_KILLED: string[], TASK_FAILED: string[], TASK_KILLED_UNHEALTHY: string[]}}}
 */
function newRequestModel(params) {
    assert(params, "参数不可为空");
    assert(params.id, "id是必须参数");
    var request = defaultModel();
    request.id = params.id;
    params.owners && (request.owners = params.owners.split(","));
    params.instances && (request.instances = params.instances - 0);
    params.rackAffinity && (request.rackAffinity = params.rackAffinity.split(","));
    params.loadBalanced !== undefined && (request.loadBalanced = !!params.loadBalanced);
    return request;
}
/**
 * 新建一个singularity的请求
 * @param params {{id:string,owners:string,instances:number,command: string, resources: {numPorts: number}, uris: String, healthcheckUri: string, serviceBasePath: string, loadBalancerGroups: String}}
 */
function createRequest(params) {
    var model = newRequestModel(params);
    //先删除，后重新发布
    //$.delete(CONFIG.singularityUrl + '/api/requests/request/' + model.id, {json: {message: "redeploy"}}, function (err, resp, body) {
    $.post(CONFIG.singularityUrl + '/api/requests', {
        json: model
    }, function (err, resp, body) {
        assert(!err, UTIL.formatString("创建请求时出现异常,err={},params={}", err, model));
        assert(resp.statusCode >= 200 && resp.statusCode <= 299, UTIL.formatString("未成功创建请求,{},参数={}", body, model));
        //创建请求成功，进行添加发布
        console.log(UTIL.formatString("创建请求成功,准备发布！参数={},结果={}", model, body));
        if (body.state === "PAUSED") {
            //先取消pause
            unpause(body.id, function (err, resp, body) {
                setTimeout(function () {
                    createRequest(params);
                }, 2000);
            });
        } else if (body.pendingDeployState) {
            var data = body.pendingDeployState.deployMarker;
            console.log(UTIL.formatString("取消发布,{}", data));
            //先取消pending再发布
            $.delete(CONFIG.singularityUrl + "/api/deploys/deploy/" + data.deployId + "/request/" + data.requestId, {
                json: {
                    requestId: data.requestId,
                    deployId: data.deployId
                }
            }, function (err, resp, body) {
                setTimeout(function () {
                    DEPLOY.createDeploy(params);
                }, 2000);
            });
        } else {
            DEPLOY.createDeploy(params);
        }
        //DEPLOY.createDeploy(params);
    });
    //});

}
/**
 * 管理请求的状态
 * @param  requestId {string}
 * @param  cmd {string} re|restart start stop
 */
function controlRequest(requestId, cmd) {
    $.get(CONFIG.singularityUrl + '/api/requests/request/' + requestId, function (err, resp, body) {
        body = JSON.parse(body);
        if (err) {
            console.log(UTIL.formatString("XXXXXXXXXXXXcontrolRequest error:requestId={},cmd={}", requestId, cmd));
            return;
        }
        if (body.state === "PAUSED") {
            switch (cmd) {
                case 'stop':
                    break;
                case 'start':
                case 're':
                case 'restart':
                    unpause(requestId);
                    break;
            }
        } else {
            switch (cmd) {
                case 'stop':
                    pause(requestId);
                    break;
                case 'start':
                    break;
                case 're':
                case 'restart':
                    bounce(requestId);
                    break;
            }
        }

    });
}

function unpause(requestId, callback) {
    postRequestId(requestId + '/unpause', callback);
}
function pause(requestId, callback) {
    postRequestId(requestId + '/pause', callback);
}
function bounce(requestId, callback) {
    pause(requestId,function(){
        setTimeout(function(){
            unpause(requestId);
        },10000);
    });
}

/**
 * 发送请求编号到不同的地址，实现不同的功能
 * @param uri {string}
 * @param callback {function} 回调
 */
function postRequestId(uri, callback) {
    $.post(CONFIG.singularityUrl + '/api/requests/request/' + uri, {}, function (err, resp, body) {
        if (callback) {
            callback(err, resp, body);
        } else {
            if (err) {
                console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX:' + uri);
            }
        }
    });
}

exports.createRequest = createRequest;
exports.controlRequest = controlRequest;