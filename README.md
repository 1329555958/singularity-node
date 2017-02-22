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
 INSTANCE_NAME ENV_INFO CONTEXT_NAME GIT_NAME INSTANCE_CMD 
### 可选参数
 DOMAIN ，如果需要url访问，就需要指定域名
 
## 示例
 `node /home/func114/singularity-node/app/singularity.js "INSTANCE_NAME=cmf-task" "ENV_INFO=func114" "CONTEXT_NAME=cmf-task"  "GIT_NAME=fj345_cmf-task"  "INSTANCE_CMD=fj344_cmf_func111_build_20170122.1" "DOMAIN=func114intra.vfinance.cn"`
 singularity.js请使用绝对路径进行引用

# 批量发布
## 说明
 将需要发布的应用按照"ENV_INFO:INSTANCE_NAME:CONTEXT_NAME:GIT_NAME:INSTANCE_CMD[:DOMAIN]（其中DOMAIN是可以不指定的）"的组合方式写入到一个文件内(例如本目录下的svnfunc114.txt)
 一行一个应用信息 ,使用#或者//开头的为注释内容

## 示例
`node /home/func114/singularity-node/app/batch.js file=/home/func114/singularity-node/svnfunc114.txt`
 请使用绝对路径进行文件的引用


# 注意事项
## 添加域名解析
  10.65.213.16 git.vfinance.cn

  10.65.215.12 func114admin.vfinance.cn func114fcw.vfinance.cn func114intra.vfinance.cn func114.vfinance.cn
  10.65.215.13 vfintra5.hdfs.cn 
  10.65.215.34 vfintra4.hdfs.cn
  10.65.215.33 vfintra3.hdfs.cn 
  10.65.215.32 vfintra2.hdfs.cn
  10.65.215.31 vfintra1.hdfs.cn
## 负载均衡地址
  同一个应用在一个nginx中只能部署一次，因为相同的路径在一个只能出现一次，即使是在不同的域名下

