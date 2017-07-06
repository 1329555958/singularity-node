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
 INSTANCE_NAME ENV_INFO CONTEXT_NAME GIT_NAME INSTANCE_CMD(支持start/stop/restart|re/remove)
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


# 发布ttserver
INSTANCE_NAME 自定义比如ttserver
ENV_INFO 
CONTEXT_NAME 与INSTANCE_NAME相同
GIT_NAME 用来指定memcached的标识，用;分隔
INSTANCE_CMD 自由指定
DOMAIN 域名
DOCKER_IMAGE ttserver

## 示例
`node app/singularity.js "INSTANCE_NAME=ttserver" "ENV_INFO=func120" "CONTEXT_NAME=ttserver"  "GIT_NAME=index.com.netfinworks.antifraud;index.com.netfinworks.xxxx"  "INSTANCE_CMD=test" DOMAIN=func120intra.vfinance.cn "DOCKER_IMAGE=ttserver"`
发布完之后 使用DOMAIN/INSTANCE_NAME 就可以访问ttserver了，就可以获取memcache地址了 

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


## spring cloud eureka
`BEFORE_CMD=eval export eureka_instance_nonSecurePort=\$PORT eureka_instance_hostname=\$TASK_HOST eureka_instance_ipAddress=\$TASK_HOST eureka_instance_instanceId=\$TASK_HOST:\$INSTANCE_NAME:\$PORT`
用来解决服务注册发现的问题，注册时使用主机实际端口跟ip
