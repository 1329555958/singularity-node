# 发布单个应用
## 示例
`node app/singularity.js "INSTANCE_NAME=cmf-task" "ENV_INFO=func114" "CONTEXT_NAME=cmf-task"  "GIT_NAME=fj345_cmf-task"  "INSTANCE_CMD=fj344_cmf_func111_build_20170122.1" "DOMAIN=func114intra.vfinance.cn"`
## 参数说明
INSTANCE_NAME ENV_INFO CONTEXT_NAME GIT_NAME INSTANCE_CMD 是必须参数
DOMAIN 是可选的，如果需要url访问，就需要指定域名；否则不会进行负载均衡，就无法访问

# 批量发布
`node /home/func114/singularity-node/app/batch.js file=/home/func114/singularity-node/svnfunc114.txt`
配置文件内容为一行一个应用信息 ENV_INFO:INSTANCE_NAME:CONTEXT_NAME:GIT_NAME:INSTANCE_CMD[:DOMAIN] 其中DOMAIN是可以不指定的
使用#或者//开头的为 注释行

# 注意事项
执行时文件路径要使用决定路径
比如 node /home/func114/singularity-node/app/batch.js file=/home/func114/singularity-node/svnfunc114.txt



