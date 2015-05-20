#!/bin/bash
#rm -rf ./log
#mkdir log
#touch log/error.log
#touch log/server.log
#sudo chmod -R 777 log
cd ~
cd /var/www/vhosts/dev/tradie/approot
nohup node server.js > log/server.log > log/error.log < /dev/null &
echo "SERVER MIGHT BE UP. CHECK IN BROWSA BEYATCH. OH THE LOGS 2! :)"
