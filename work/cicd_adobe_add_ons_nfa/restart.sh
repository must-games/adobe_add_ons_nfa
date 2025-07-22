pm2 stop cicd-adobe-add-ons-nfa
pm2 delete cicd-adobe-add-ons-nfa
#npm run pm2-start
pm2 start ecosystem.config.cjs