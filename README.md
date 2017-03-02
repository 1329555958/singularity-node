# 安装
### 基础环境
  需要安装nodejs环境
### 下载
`git clone http://gitlab.vfinance.cn/mesos/singularity-node.git`
### 安装node模块
```
cd singularity-node
npm install
```
### 配置
  修改`/app/common/config.js`中的配置项，最主要有两个:
1. singularityUrl
  singularity的访问地址
2. loadBalancerGroups
  这个是对应的nginx节点(安装时指定的)
# 发布单个应用
## 说明
### 必须参数
 INSTANCE_NAME ENV_INFO CONTEXT_NAME GIT_NAME INSTANCE_CMD(支持start/stop/restart)
### 可选参数
 DOMAIN ，如果需要url访问，就需要指定域名
 DOCKER_IMAGE,可选vftomcat8-jdk8-1.0 | vftomcat7-jdk6-1.0 | vftomcat6-jdk6-1.0,默认使用的是vftomcat8-jdk8-1.0
## 示例
 `node /home/func114/singularity-node/app/singularity.js "INSTANCE_NAME=cmf-task" "ENV_INFO=func114" "CONTEXT_NAME=cmf-task"  "GIT_NAME=fj345_cmf-task"  "INSTANCE_CMD=fj344_cmf_func111_build_20170122.1" "DOMAIN=func114intra.vfinance.cn"`
 singularity.js请使用绝对路径进行引用

# 批量发布
## 说明
 将需要发布的应用按照"ENV_INFO:INSTANCE_NAME:CONTEXT_NAME:GIT_NAME:INSTANCE_CMD:[DOMAIN]:[DOCKER_IMAGE]（其中DOMAIN、DOCKER_IMAGE是可以不指定的）"的组合方式写入到一个文件内(例如本目录下的svnfunc114.txt)
 一行一个应用信息 ,使用#或者//开头的为注释内容

## 示例
`node /home/func114/singularity-node/app/batch.js file=/home/func114/singularity-node/svnfunc114.txt`
 请使用绝对路径进行文件的引用


# 注意事项
## 添加域名解析
```
  10.65.213.16 git.vfinance.cn

  10.65.215.12 func114admin.vfinance.cn func114fcw.vfinance.cn func114intra.vfinance.cn func114.vfinance.cn
  10.65.215.13 vfintra5.hdfs.cn 
  10.65.215.34 vfintra4.hdfs.cn
  10.65.215.33 vfintra3.hdfs.cn 
  10.65.215.32 vfintra2.hdfs.cn
  10.65.215.31 vfintra1.hdfs.cn
```

域名的配置必须首先存在，参考func114fcw.vfinance.cn.conf
```
server {
    listen 80;
    server_name func114fcw.vfinance.cn;
    access_log /var/log/nginx/func114fcw.vfinance.cn_access.log  main;
    proxy_set_header Host             $host;
    proxy_set_header X-Real-IP        $remote_addr;
    proxy_connect_timeout 60;
    proxy_read_timeout 60;
    proxy_set_header X-Forwarded-For $http_x_forwarded_for;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    client_max_body_size 20m;
 
 
    include /etc/nginx/conf.d/proxy/func114fcw.vfinance.cn/*.conf;
}
include /etc/nginx/conf.d/upstreams/func114fcw.vfinance.cn/*.conf;
```
## 负载均衡地址
  同一个应用在同一套环境中只能部署一次，因为相同的路径在一个只能出现一次，即使是在不同的域名下

