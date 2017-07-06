#!/bin/bash
. /etc/profile
git clone git://git.vfinance.cn/docker_tools.git /opt/applications/docker_tools

# replace finlog jdk 6
#rm -f /opt/applications/docker_tools/docker_tools/finlog/finlog.jar
#mv /opt/finlog-jdk6-*.jar /opt/applications/docker_tools/docker_tools/finlog/finlog.jar

# logs 让日志文件在singularity中也可以看到
mkdir -p $MESOS_SANDBOX/logs
mkdir -p $MESOS_SANDBOX/tomcat
rm -rf /opt/app/tomcat/logs
ln -s $MESOS_SANDBOX/logs /opt/logs
ln -s $MESOS_SANDBOX/tomcat /opt/app/tomcat/logs

echo before_cmd=$BEFORE_CMD
$BEFORE_CMD

export STICKY=${STICKY:-false}

HOST=$HOST_IP

PROTO=${PROTO:-tcp}
init_cmd="source /opt/applications/docker_tools/docker_tools/init.sh"
echo $init_cmd
$init_cmd

tomcat_cmd="source /opt/applications/docker_tools/docker_tools/createTomcatInstance.sh"
echo $tomcat_cmd
$tomcat_cmd

after_cmd="source /opt/applications/docker_tools/docker_tools/after.sh"
echo $after_cmd
$after_cmd

tail -f $CATALINA_HOME/logs/catalina.out

echo docker exit because the cmd end

#run --privileged --cpu-shares 102 --memory 1073741824 -e INSTANCE_NO=1 -e TASK_HOST=10.65.213.13 -e TASK_RACK_ID=DOCKER -e TASK_REQUEST_ID=func119.guardian-api -e TASK_DEPLOY_ID=fj321_guardian_func111_build_20170104.2_134632 -e TASK_ID=func119.guardian-api-fj321_guardian_func111_build_20170104.2_134632-1497865750123-1-10.65.213.13-DOCKER -e ESTIMATED_INSTANCE_COUNT=1 -e INSTANCE_NAME=guardian-api -e ENV_INFO=func119 -e CONTEXT_NAME=guardian-api -e GIT_NAME=fj322_guardian-api -e INSTANCE_CMD=fj321_guardian_func111_build_20170104.2 -e DOMAIN=func119intra.vfinance.cn -e PORT=31933 -e PORT0=31933 -e MESOS_SANDBOX=/mnt/mesos/sandbox -e MESOS_CONTAINER_NAME=mesos-70a5aa07-7c8a-48a2-b94d-5b4e216d6f5c-S465.efc4f9c0-66fc-4acd-970f-13dc74086ba2 -v /opt/mesos/workspace/slaves/70a5aa07-7c8a-48a2-b94d-5b4e216d6f5c-S465/frameworks/Singularity/executors/func119.guardian-api-fj321_guardian_func111_build_20170104.2_134632-1497865750123-1-10.65.213.13-DOCKER/runs/efc4f9c0-66fc-4acd-970f-13dc74086ba2:/mnt/mesos/sandbox --net bridge --add-host=git.vfinance.cn:10.65.213.16 -p 31933:8080/tcp --name mesos-70a5aa07-7c8a-48a2-b94d-5b4e216d6f5c-S465.efc4f9c0-66fc-4acd-970f-13dc74086ba2 10.5.16.9:5000/vftomcat8-jdk8-1.0 /opt/dockerInit.sh
#run --privileged --cpu-shares 102 --memory 1073741824 -e INSTANCE_NO=1 -e TASK_HOST=10.65.215.12 -e TASK_RACK_ID=DOCKER -e TASK_REQUEST_ID=func119.guardian-api -e TASK_DEPLOY_ID=fj321_guardian_func111_build_20170104.2_134632 -e TASK_ID=func119.guardian-api-fj321_guardian_func111_build_20170104.2_134632-1497865750123-1-10.65.213.13-DOCKER -e ESTIMATED_INSTANCE_COUNT=1 -e INSTANCE_NAME=guardian-api -e ENV_INFO=func119 -e CONTEXT_NAME=guardian-api -e GIT_NAME=fj322_guardian-api -e INSTANCE_CMD=fj321_guardian_func111_build_20170104.2 -e DOMAIN=func119intra.vfinance.cn -e PORT=31933 -e PORT0=31933 -e PORT1=31934 -e MESOS_SANDBOX=/mnt/mesos/sandbox --net bridge --add-host=git.vfinance.cn:10.65.213.16 -p 31933:8080/tcp -p 31934:8081/tcp --name mesos ttserver /opt/dockerInit.sh
#docker run -it --privileged --cpu-shares 102 --memory 1073741824 -e INSTANCE_NO=1 -e TASK_HOST=10.65.215.12 -e TASK_RACK_ID=DOCKER -e TASK_REQUEST_ID=func121.cas-web -e TASK_DEPLOY_ID=fj147_vfsso_func111_build_20161114.1_130710 -e TASK_ID=func121.cas-web-fj147_vfsso_func111_build_20161114.1_130710-1496369827571-1-10.65.215.12-DOCKER -e ESTIMATED_INSTANCE_COUNT=1 -e INSTANCE_NAME=cas-web -e ENV_INFO=func121 -e CONTEXT_NAME=cas-web -e GIT_NAME=fj147_cas-web -e INSTANCE_CMD=fj147_vfsso_func111_build_20161114.1 -e DOMAIN=func121intra.vfinance.cn -e PORT=31990 -e PORT0=31990 -e MESOS_SANDBOX=/mnt/mesos/sandbox --net bridge --add-host=git.vfinance.cn:10.65.213.16  10.5.16.9:5000/vftomcat8-jdk8-1.0:1.0.6 bash