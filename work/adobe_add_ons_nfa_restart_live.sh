#!/bin/bash
# dev용.
cd /home/ubuntu/adobeaddon

mv ./adobe_add_ons_nfa/Server/logs ./logs

pm2 stop adobe_add_ons_nfa
pm2 delete adobe_add_ons_nfa
rm -rf adobe_add_ons_nfa

git clone -b main git@github.com:must-games/adobe_add_ons_nfa.git adobe_add_ons_nfa

cd adobe_add_ons_nfa/Server

#npx clear-npx-cache

echo "npm install"
npm i

echo "npm build"
npm run build

#로그 다시 복구
mv logs ./Server/adobe_add_ons_nfa/logs

echo "start worker"

pm2 start ecosystem.config.cjs
