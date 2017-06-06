#!/bin/bash
. /etc/profile
git clone git://git.vfinance.cn/docker_tools.git /opt/applications/docker_tools

# replace finlog jdk 6
#rm -f /opt/applications/docker_tools/docker_tools/finlog/finlog.jar
#mv /opt/finlog-jdk6-*.jar /opt/applications/docker_tools/docker_tools/finlog/finlog.jar

# logs 让日志文件在singularity中也可以看到
mkdir -p $MESOS_SANDBOX/opt/logs
mkdir -p $MESOS_SANDBOX/tomcat/logs
rm -rf /opt/app/tomcat/logs
ln -s $MESOS_SANDBOX/opt/logs /opt/logs
ln -s $MESOS_SANDBOX/tomcat/logs /opt/app/tomcat/logs


echo before_cmd=$BEFORE_CMD
/bin/bash -c "$BEFORE_CMD"

export STICKY=${STICKY:-false}

HOST=$HOST_IP

PROTO=${PROTO:-tcp}

logstash_cmd="nohup /opt/logstash-5.4.1/bin/start.sh &"
echo $logstash_cmd
$logstash_cmd


tomcat_cmd="source /opt/applications/docker_tools/docker_tools/createTomcatInstance.sh"
echo $tomcat_cmd
$tomcat_cmd

tail -f $CATALINA_HOME/logs/catalina.out

echo docker exit because the cmd end


#docker run -it --privileged --cpu-shares 102 --memory 1073741824 -e INSTANCE_NO=1 -e TASK_HOST=10.65.215.12 -e TASK_RACK_ID=DOCKER -e TASK_REQUEST_ID=func121.cas-web -e TASK_DEPLOY_ID=fj147_vfsso_func111_build_20161114.1_130710 -e TASK_ID=func121.cas-web-fj147_vfsso_func111_build_20161114.1_130710-1496369827571-1-10.65.215.12-DOCKER -e ESTIMATED_INSTANCE_COUNT=1 -e INSTANCE_NAME=cas-web -e ENV_INFO=func121 -e CONTEXT_NAME=cas-web -e GIT_NAME=fj147_cas-web -e INSTANCE_CMD=fj147_vfsso_func111_build_20161114.1 -e DOMAIN=func121intra.vfinance.cn -e PORT=31990 -e PORT0=31990 -e MESOS_SANDBOX=/mnt/mesos/sandbox --net bridge --add-host=git.vfinance.cn:10.65.213.16  10.5.16.9:5000/vftomcat8-jdk8-1.0:1.0.3 bash