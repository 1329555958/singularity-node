#!/bin/bash
git clone git://git.vfinance.cn/docker_tools.git /opt/applications/docker_tools
# start ttserver
mkdir -p $MESOS_SANDBOX
ln -s /usr/local/tokyocabinet/lib/libtokyocabinet.so.9 libtokyocabinet.so.9
node /opt/ttserver/ttserver.js