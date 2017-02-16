/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2017/1/18
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description   转换邮件数据格式
 */
var http = require('http');
var url = require('url');
var querystring = require("querystring");
var config = require("./config");
var i = 0;
http.createServer(function (req, res) {
    try {
        var postData = "";
        req.setEncoding('utf-8');
        if (req.method === "POST") {
            // 数据块接收中
            req.addListener("data", function (postDataChunk) {
                postData += postDataChunk;
            });
            var isJson = req.headers['content-type'].indexOf('application/x-www-form-urlencoded') === -1;
            // 数据接收完毕，执行回调函数
            req.addListener("end", function () {
                try {
                    postData = postData.replace(/\\r\\n/g, '<br/>');
                    var params = querystring.parse(postData);//GET & POST  //解释表单数据部分{name="zzl",email="zzl@sina.com"}
                    if (isJson) {
                        params = JSON.parse(postData);
                    }
                    console.log('数据接收完毕:', params);
                    //转发邮件

                    sendMail(params);
                } catch (e) {
                    console.log("邮件发送失败:" + e.message)
                }

            });
        } else {
            postData = url.parse(req.url).query;
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST,GET, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');

        res.end(JSON.stringify({method: req.method, data: postData, count: i, time: new Date(), url: req.url}));
    } catch (e) {
        res.statusCode = 500;
        res.end(e.message);
        console.error(e);
    }
}).listen(config.port);

function sendMail(data) {
    /*
     &orderNo=111111111111119&protocol=M&targetIdenty=weifeng@netfinworks.com&targetCount=1&isRealTime=true&content=test&subject=test9
     */
    /*
     { tos: 'weifeng@netfinworks.com',
     subject: '[P3][PROBLEM][app6][][falcon agent挂了 all(#1) net.port.listen port=19883 0==0][O1 2017-01-17 17:14:00]',
     content: 'PROBLEM\r\nP3\r\nEndpoint:app6\r\nMetric:net.port.listen\r\nTags:port=19883\r\nall(#1): 0==0\r\nNote:falcon agent挂了\r\nMax:2, Current:1\r\nTimestamp:2017-01-17 17:14:00\r\nhttp://10.28.1.27:5050/template/view/1\r\n' }
     */
    data.appId = "SMSG";
    data.orderNo = new Date().getTime() + "0" + i;
    data.targetIdenty = data.tos;
    delete data.tos;
    data.targetCount = data.targetIdenty.split(",").length;
    //判断数据是邮件还是短信
    data.protocol = data.subject ? "M" : "S";
    data.isRealTime = true;

    var opts = url.parse(config.url, false, true);
    opts.method = 'POST';
    opts.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    var req = http.request(opts, function (res) {
        res.setEncoding('utf8');
        var respData = '';
        res.on('data', function (chunk) {
            respData += chunk;
        });
        res.on('end', function () {
            console.log("发送结果:" + respData);
        });
    });
    req.on('error', function (e) {
        console.log("发送失败" + e.message);
    });
    console.log("发送数据:" + JSON.stringify(data));
    req.write(querystring.stringify(data));
    req.end();
}




