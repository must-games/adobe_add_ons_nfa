#!/bin/bash

export HOME=/home/ubuntu
export PATH=$PATH:/usr/bin/pm2
source /home/ubuntu/.bashrc

#sudo certbot renew --force-renewal 
# sudo certbot renew --dry-run

echo "🔄 Let's Encrypt 인증서 갱신 완료됨. PM2 프로세스 재시작 중..."
#dev
cp /etc/letsencrypt/live/adobe-hair-back.mustg.kr/fullchain.pem /home/ubuntu/adobeaddon/adobe_add_ons_hair_dev/fullchain.pem
cp /etc/letsencrypt/live/adobe-hair-back.mustg.kr/privkey.pem /home/ubuntu/adobeaddon/adobe_add_ons_hair_dev/privkey.pem
chmod 644 /home/ubuntu/adobeaddon/adobe_add_ons_hair_dev/*.pem

cd /home/ubuntu/adobeaddon/adobe_add_ons_hair_dev
#git pull origin dev
#git commit -m "update pem files" -- '*.pem'
#git push origin dev
pm2 restart adobe_add_ons_hair_dev

#main
cp /etc/letsencrypt/live/adobe-hair-back.mustg.kr/fullchain.pem /home/ubuntu/adobeaddon/adobe_add_ons_hair/fullchain.pem
cp /etc/letsencrypt/live/adobe-hair-back.mustg.kr/privkey.pem /home/ubuntu/adobeaddon/adobe_add_ons_hair/privkey.pem
chmod 644 /home/ubuntu/adobeaddon/adobe_add_ons_hair/*.pem

cd /home/ubuntu/adobeaddon/adobe_add_ons_hair
#git commit -m "update pem files" -- '*.pem'
#git push origin main
pm2 restart adobe_add_ons_hair

#git config --global user.name "adobe_add_ons_hair"
#git config --global user.email "ggh228@mustg.kr"