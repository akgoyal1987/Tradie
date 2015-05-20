#!/bin/bash
cd ..
npm install
bower install
#scp -rp client/assets/js/vendor ubuntu@dev:/var/www/vhosts/dev/app.getglance.com/approot/client/assets/js/vendor

#git config http.postBuffer 524288000
#ab -n 1000 -c 10 http://www.getglance.com/