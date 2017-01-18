#!/usr/bin/env bash
kill -9 `cat pid.txt |awk '{print $1}'`
nohup node mail.js >mail.log 2>&1 &
echo $!>pid.txt
tail -f mail.log