#! /bin/bash
#node app/singularity.js "INSTANCE_NAME=ma-web" "ENV_INFO=func111" "CONTEXT_NAME=ma-web"  "GIT_NAME=fj342_ma-web"  "INSTANCE_CMD=fj342_ma-web_func111_build_20170214.1" DOMAIN=tmp.test.cn "instances=2"
#node app/singularity.js "INSTANCE_NAME=ma-web" "ENV_INFO=func111" "CONTEXT_NAME=ma-web"  "GIT_NAME=fj342_ma-web"  "INSTANCE_CMD=stop" DOMAIN=tmp.test.cn
#node app/singularity.js "INSTANCE_NAME=ttserver" "ENV_INFO=func120" "CONTEXT_NAME=ttserver"  "GIT_NAME=index.com.netfinworks.antifraud"  "INSTANCE_CMD=base" DOMAIN=func120intra.vfinance.cn "DOCKER_IMAGE=ttserver"
#node app/singularity.js "INSTANCE_NAME=ma-web" "ENV_INFO=func111" "CONTEXT_NAME=ma-web"  "GIT_NAME=fj342_ma-web"  "INSTANCE_CMD=restart" DOMAIN=tmp.test.cn_build_20170122.1"

#activemq
node app/singularity.js "INSTANCE_NAME=activemq" "ENV_INFO=func125" "CONTEXT_NAME=activemq"  "GIT_NAME=activemq"  "INSTANCE_CMD=test" "DOCKER_IMAGE=activemq" "rackAffinity=dev21514" "activemqPorts=31861,31616"