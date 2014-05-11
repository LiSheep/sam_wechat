#!/bin/bash


if [ ! -d "logs" ]; then
	mkdir logs
fi

if [ "$#" -lt 1 ]; then
	echo "error: 至少指定一个非80端口"
	exit -1
fi
for var in "$@"; do
	if [ "$var" -eq 80 ]; then
		echo "error: 至少指定一个非80端口"
		exit -1
	fi
done


for var in "$@"; do
	if [ ! -f "./logs/forever_$var.log" ]; then
		touch "./logs/forever_$var.log"
	fi
	forever start -p $(pwd)/logs -a -l forever_$var.log -o logs/out_$var.log -e logs/err_$var.log app.js $var
	perl -e 'sleep(2)'
	curl http://localhost:$var/loadList
done
