#!/bin/bash
# start ttserver
mkdir -p $MESOS_SANDBOX
node /opt/ttserver/ttserver.js
chmod +x /opt/ttserver.sh
/opt/ttserver.sh
tail -f $MESOS_SANDBOX/ttserver.log