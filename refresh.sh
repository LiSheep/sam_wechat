#!/bin/bash

forever restartall
perl -e 'sleep(2)'
echo "restart ok"

echo "begin load list"
cat run.pid|while read line;do
OLD_IFS="$IFS"
IFS=","
ports=($line)
IFS="$OLD_IFS" 
for var in ${ports[@]}; do
	curl http://localhost:$var/loadList
	echo "refresh $var.."
done
done
