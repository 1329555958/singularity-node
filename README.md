# 安装


# 发布单个应用
## 示例
`node app/singularity.js "INSTANCE_NAME=cmf-task" "ENV_INFO=func114" "CONTEXT_NAME=cmf-task"  "GIT_NAME=fj345_cmf-task"  "INSTANCE_CMD=fj344_cmf_func111_build_20170122.1" "DOMAIN=func114intra.vfinance.cn"`
## 参数说明
INSTANCE_NAME ENV_INFO CONTEXT_NAME GIT_NAME INSTANCE_CMD 是必须参数
DOMAIN 是可选的，如果需要url访问，就需要指定域名；否则不会进行负载均衡，就无法访问

# 批量发布


