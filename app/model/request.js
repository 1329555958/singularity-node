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
        "loadBalanced": true,
        "slavePlacement": "SEPARATE",
        "emailConfigurationOverrides": {
            "TASK_LOST": ["OWNERS", "ADMINS"],
            "TASK_KILLED": ["OWNERS", "ADMINS"],
            "TASK_FAILED": ["OWNERS", "ADMINS"],
            "TASK_KILLED_UNHEALTHY": ["OWNERS", "ADMINS"]
        }
    };
}
/**
 * 新建一个singularity的请求模型
 * @param params {{id,owners,instances}|{id:string,owners:string[],instances:number,command: string, resources: {numPorts: number}, uris: String, healthcheckUri: string, serviceBasePath: string, loadBalancerGroups: String}}
 * @returns {{id, requestType, owners, instances, rackSensitive, loadBalanced, slavePlacement, emailConfigurationOverrides}|{id: string, requestType: string, owners: string[], instances: number, rackSensitive: boolean, loadBalanced: boolean, slavePlacement: string, emailConfigurationOverrides: {TASK_LOST: string[], TASK_KILLED: string[], TASK_FAILED: string[], TASK_KILLED_UNHEALTHY: string[]}}}
 */
function newRequestModel(params) {
    assert(params, "参数不可为空");
    assert(params.id, "id是必须参数");
    var request = defaultModel();
    request.id = params.id;
    params.owners && (request.owners = params.owners.split(","));
    params.instances && (request.instances = params.instances - 0);
    return request;
}
/**
 * 新建一个singularity的请求
 * @param params {{id:string,owners:string,instances:number,command: string, resources: {numPorts: number}, uris: String, healthcheckUri: string, serviceBasePath: string, loadBalancerGroups: String}}
 */
function createRequest(params) {
    var model = newRequestModel(_.pick(params, 'id', 'owners', 'instances'));
    $.post(CONFIG.singularityUrl + '/api/requests', {
        json: model
    }, function (err, resp, body) {
        assert(!err, UTIL.formatString("创建请求时出现异常,err={},params={}", err, model));
        assert(resp.statusCode >= 200 && resp.statusCode <= 299, UTIL.formatString("未成功创建请求,{},参数={}", body, model));
        //创建请求成功，进行添加发布
        console.log(UTIL.formatString("创建请求成功,准备发布！参数={},结果={}", model, body));
        DEPLOY.createDeploy(params);
    });
}


exports.createRequest = createRequest;
