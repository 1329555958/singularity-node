#!/bin/bash
. /etc/profile
git clone git://git.vfinance.cn/docker_tools.git /opt/applications/docker_tools

# replace finlog jdk 6
#rm -f /opt/applications/docker_tools/docker_tools/finlog/finlog.jar
#mv /opt/finlog-jdk6-*.jar /opt/applications/docker_tools/docker_tools/finlog/finlog.jar

echo before_cmd=$BEFORE_CMD
/bin/bash -c "$BEFORE_CMD"

export STICKY=${STICKY:-false}

HOST=$HOST_IP

PROTO=${PROTO:-tcp}
tomcat_cmd="source /opt/applications/docker_tools/docker_tools/createTomcatInstance.sh"
echo $tomcat_cmd
$tomcat_cmd

tail -f $CATALINA_HOME/logs/catalina.out

echo docker exit because the cmd end