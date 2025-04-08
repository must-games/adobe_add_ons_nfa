#!/bin/bash
# dev용.
cd /home/ubuntu/adobeaddon

mv ./adobe_add_ons_dev/Server/logs ./logs

pm2 stop adobe_add_ons_hair_dev
pm2 delete adobe_add_ons_hair_dev

rm -rf adobe_add_ons_hair_dev

git clone -b dev git@github.com:must-games/adobe_add_ons_hair.git adobe_add_ons_hair_dev

cd adobe_add_ons_hair_dev/Server

#npx clear-npx-cache

echo "npm install"
npm i

echo "npm build"
npm run build

#로그 다시 복구
mv logs ./Server/adobe_add_ons_hair_dev/logs

echo "start worker"

pm2 start ecosystem_dev.config.cjs
