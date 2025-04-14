module.exports = {
    apps: [
        {
            name: 'cicd-adobe-add-ons-hair', // 애플리케이션 이름
            script: 'npm', // 실행할 스크립트
            args: 'run start', // npm 스크립트 (npm run start)
            env: {
                TEST_ENV: 'tt',
            },
        },
    ],
}
