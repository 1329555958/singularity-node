#! /bin/bash
#node app/singularity.js "INSTANCE_NAME=ma-web" "ENV_INFO=func111" "CONTEXT_NAME=ma-web"  "GIT_NAME=fj342_ma-web"  "INSTANCE_CMD=fj342_ma-web_func111_build_20170214.1" DOMAIN=tmp.test.cn
#node app/singularity.js "INSTANCE_NAME=ma-web" "ENV_INFO=func111" "CONTEXT_NAME=ma-web"  "GIT_NAME=fj342_ma-web"  "INSTANCE_CMD=stop" DOMAIN=tmp.test.cn
node app/singularity.js "INSTANCE_NAME=ma-web" "ENV_INFO=func111" "CONTEXT_NAME=ma-web"  "GIT_NAME=fj342_ma-web"  "INSTANCE_CMD=start" DOMAIN=tmp.test.cn
#node app/singularity.js "INSTANCE_NAME=ma-web" "ENV_INFO=func111" "CONTEXT_NAME=ma-web"  "GIT_NAME=fj342_ma-web"  "INSTANCE_CMD=restart" DOMAIN=tmp.test.cn_build_20170122.1"