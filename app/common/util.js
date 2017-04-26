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
var placeholder = '{}';
var _ = require('lodash');

function stringify(p) {
    return _.isObject(p) ? JSON.stringify(p) : p;
}
/**
 * 根据参数格式化字符串
 * @param str 包含{}的字符串，根据后面参数的位置替换{}
 */
exports.formatString = function (str) {
    var segments = str.split(placeholder);
    var message = [];
    for (var i = 0; i < Math.min(segments.length - 1, arguments.length - 1); i++) {
        message.push(segments[i]);
        //arguments第一个是带有占位符的字符串
        message.push(stringify(arguments[i + 1]));
    }
    message = message.concat(segments.slice(i));
    return message.join('');
};

/**
 * 将命令行参数转换为json对象，
 * @param params {[string]} key=value分隔的键值对的数组列表
 * @return {{}}
 */
exports.commandLineParamsToJSON = function (params) {
    var obj = {};
    _.each(params, function (p) {
        var splitIndex = p.indexOf('=');
        if (splitIndex !== -1) {
            obj[p.substring(0, splitIndex)] = p.substring(splitIndex + 1).trim();
        }
    });
    return obj
};
/**
 * 将一个对象obj中的一些属性sourceProperties移动到destProperty上
 * @param obj {{}}
 * @param destProperty {string}
 * @param sourceProperties {[string]}
 */
exports.moveProperties = function (obj, destProperty, sourceProperties) {
    obj[destProperty] = _.pick(obj, sourceProperties);
    _.each(sourceProperties, function (k) {
        delete  obj[k];
    });
};
/**
 * 获取docker的名称，去除多余的/
 * @param registryUrl
 * @param tag
 * @returns {string}
 */
exports.getDockerImageName = function (registryUrl, tag) {
    var name = (registryUrl + '/' + tag).replace(/\/\//g, '/');
    if (_.startsWith(name, '/')) {
        return name.substring(1);
    }
    return name;
};
exports.dateUtil = {

    calendar: {
        "year": "Year",
        "month": "Mon",
        "week": "Week",
        "day": "Day",
        "hour": "Hour",
        "minute": "Min",
        "second": "Sec"
    },

    /**
     * 格式化
     */
    format: function (date, format) {
        format = arguments[1] || "yyyyMMddhhmmss";
        var o = {
            "M+": date.getMonth() + 1, // month
            "d+": date.getDate(), // day
            "h+": date.getHours(), // hour
            "m+": date.getMinutes(), // minute
            "s+": date.getSeconds(), // second
            "q+": Math.floor((date.getMonth() + 3) / 3), // quarter
            "S": date.getMilliseconds()
            // millisecond
        };

        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + "")
                .substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    },
    /**
     * 解析
     * @param str
     * @returns {Date}
     */
    parse: function (str) {
        if (typeof str === 'string') {
            var date = new Date();
            var arr = str.split(/\D+/g);
            arr.length > 0 && date.setFullYear(arr[0]);
            arr.length > 1 && date.setMonth(arr[1] - 1);
            arr.length > 2 && date.setDate(arr[2]);
            arr.length > 3 && date.setHours(arr[3]);
            arr.length > 4 && date.setMinutes(arr[4]);
            arr.length > 5 && date.setSeconds(arr[5]);
            date.setMilliseconds(arr.length > 6 ? arr[6] : 0);
            return date;
        }
        return str;
    }
};

