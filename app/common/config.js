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

exports.config = {
    singularityUrl: 'http://10.65.215.34:17099/singularity',
    healthcheckUri:'_health_check',
    addHost: 'git.vfinance.cn:10.65.213.16',
    memoryMb: 1024,
    loadBalancerGroups:'testGroup',
    dockerCMD:'/opt/dockerInit.sh',
    dockerImage:'vftomcat8-jdk8-1.0',
    dockerImageVersion:'1.0',
    dockerRegistryUri:'10.5.16.9:5000/'
};
