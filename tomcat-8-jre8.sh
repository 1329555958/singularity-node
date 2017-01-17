#!/bin/bash
#移动war包
mv $MESOS_SANDBOX/*.war $CATALINA_HOME/webapps/
# 启动tomcat
$CATALINA_HOME/bin/catalina.sh run


#
#run -e MESOS_SANDBOX=/mnt/mesos/sandbox -v /var/lib/mesos/slaves/tmp:/mnt/mesos/sandbox --net bridge -p 33000:8080/tcp --entrypoint /bin/sh --name mesos tomcat:8-jre8 -c mv $MESOS_SANDBOX/*.war $CATALINA_HOME/webapps/ && $CATALINA_HOME/bin/catalina.sh run