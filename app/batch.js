/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2017/2/16
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description
 */
var assert = require('assert');
var _ = require('lodash');
var singularity = require('./singularity');
var fs = require('fs');

var SPLIT_CHART = ":";

process.on('uncaughtException', function (err) {
    console.log(err);
});

var param = singularity.processCmdParam();
assert(param.file, "请指定配置文件绝对路径!");

fs.readFile(param.file, function (err, data) {
    if (err) {
        console.error("文件路径是:" + param.file);
        throw err;
    }
    var data = data.toString();
    var items = [];
    if (data.indexOf('\r\n') !== -1) {
        items = data.split('\r\n');
    } else if (data.indexOf('\n') !== -1) {
        items = data.split('\n');
    } else {
        items.push(data);
    }

    var params = [];
    var validItems = [];
    _.each(items, function (item) {
        if (!isComment(item) && isValid(item)) {
            var param = transferParam(item);
            validItems.push(item);
            params.push(param);
        }
    });
    console.log("***********************获取到有效部署***********************************");
    console.log(validItems.length, validItems.join("\r\n"));
    console.log("***********************************************************************");
    _.each(params, function (param) {
        singularity.singularity(param);
    });

});
/**
 * 把单行使用：分隔的参数，转换为json
 * ENV_INFO:INSTANCE_NAME:CONTEXT_NAME:GIT_NAME:INSTANCE_CMD[:DOMAIN]
 * @param text
 */
function transferParam(item) {
    item = item.replace(/ /g, '');
    var arr = item.split(SPLIT_CHART);
    var param = {
        ENV_INFO: arr[0],
        INSTANCE_NAME: arr[1],
        CONTEXT_NAME: arr[2],
        GIT_NAME: arr[3],
        INSTANCE_CMD: arr[4]
    };
    if (arr[5] !== undefined) {
        param.DOMAIN = arr[5];
    }
    if(arr[6]){
        param.DOCKER_IMAGE = arr[6];
    }

    return param;
}

/**
 * 判断是否是有效参数
 * ENV_INFO:INSTANCE_NAME:CONTEXT_NAME:GIT_NAME:INSTANCE_CMD[:DOMAIN]
 * @param item
 * @returns {boolean}
 */
function isValid(item) {
    if (!item) {
        return false;
    }
    var arr = item.split(SPLIT_CHART);
    if (arr.length < 5) {
        return false;
    }
    return true;
}

/**
 * 判断是否是注释语句  # 或 //开头的都是注释
 * @param item
 * @returns {boolean}
 */
function isComment(item) {
    if (!item) {
        return false;
    }
    if (item.startsWith('#') || item.startsWith('//')) {
        return true;
    }
    return false;
}
