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
        //发布成功成功
        console.log(UTIL.formatString("发布成功,参数={},结果={}", model, body));
    });
}

exports.createDeploy = createDeploy;