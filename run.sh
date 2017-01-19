#! /bin/bash
mkdir -p /opt/pay/config/optimus && \
cp $MESOS_SANDBOX/app.properties /opt/pay/config/optimus && \
cp $MESOS_SANDBOX/*.war $CATALINA_HOME/webapps && \
$CATALINA_HOME/bin/catalina.sh run