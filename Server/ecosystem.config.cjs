module.exports = {
    apps: [
        {
            name: 'adobe_add_ons_nfa', // 애플리케이션 이름
            script: 'npm', // 실행할 스크립트
            args: 'run start', // npm 스크립트 (npm run start)
            env: {
                VENDOR: 'mustg',
                SERVER_TYPE: 'live',
                SERVER_TAG: 'abodeaddon-nfa-base',
                LOG_LEVEL: 'Debug',
                DATABASE_URL:
                    'mysql://root:evgXHfGBMUxRdKvp@210.109.14.76:3306/abodeaddon-nfa',
                SERVER_PORT: 443,
            },
        },
    ],
}
