pm2 stop cicd-adobe-add-ons-hair
pm2 delete cicd-adobe-add-ons-hair
#npm run pm2-start
pm2 start ecosystem.config.cjs