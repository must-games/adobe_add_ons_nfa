#!/bin/bash
# dev용.
cd /home/ubuntu/adobeaddon

mv ./adobe_add_ons/Server/logs ./logs

pm2 stop adobe_add_ons
pm2 delete adobe_add_ons

rm -rf adobe_add_ons

git clone -b main git@github.com:must-games/adobe_add_ons.git adobe_add_ons

cd adobe_add_ons/Server

#npx clear-npx-cache

echo "npm install"
npm i

echo "npm build"
npm run build

#로그 다시 복구
mv logs ./Server/adobe_add_ons/logs

echo "start worker"

pm2 start ecosystem.config.cjs
