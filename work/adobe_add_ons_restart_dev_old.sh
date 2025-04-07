#!/bin/bash
# dev용.

# Client, Server 모두 쓰는 버전. adobe는 외부 배포시 adobe system을 써야 해서 의미가 없다.
cd /home/ubuntu/adobeaddon

mv adobe_add_ons_dev/logs ./logs

pm2 stop adobe_add_ons_dev
pm2 delete adobe_add_ons_dev

rm -rf adobe_add_ons_dev

git clone -b dev git@github.com:must-games/adobe_add_ons.git adobe_add_ons_dev

cd adobe_add_ons_dev

#npx clear-npx-cache

echo "npm install"
npm i

echo "npm build"
npm run build

#로그 다시 복구
mv logs adobe_add_ons_dev/logs

echo "start worker"

pm2 start ecosystem_dev.config.cjs
