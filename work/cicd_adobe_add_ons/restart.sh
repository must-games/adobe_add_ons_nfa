pm2 stop cicd-adobe-add-ons
pm2 delete cicd-adobe-add-ons
#npm run pm2-start
pm2 start ecosystem.config.cjs