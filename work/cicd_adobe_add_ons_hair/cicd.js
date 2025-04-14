import express from 'express'
import crypto from 'crypto'
import { exec } from 'child_process'
import axios from 'axios'
import { promises as fs } from 'fs'

const app = express()

const secret = 'adobewebserver' // GitHub Webhook에 설정한 Secret
//GitHub Webhook에 Content type * -> Application/json 으로 설정해야한다.

app.use(express.json())

app.post('/gitcommit', (req, res) => {
    console.log('data inc' + res)

    try {
        const sig = `sha256=${crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex')}`

        if (req.headers['x-hub-signature-256'] !== sig) {
            return res
                .status(403)
                .send(
                    'Request body was not signed or the signature is incorrect'
                )
        }

        // 빠른 응답을 먼저 반환
        res.status(200).send('Webhook received, processing in background')

        const branch = req.body.ref.split('/').pop() // 브랜치 이름 추출

        let finalMessage = ''

        if (req.body.commits) {
            const combinedMessage = req.body.commits
                .map((commit) => `- ${commit.message}`) // 각 커밋 메시지를 []로 감쌈
                .join('\n') // 모든 메시지를 하나의 문자열로 합침

            finalMessage =
                combinedMessage.length > 200
                    ? combinedMessage.slice(0, 200 - 3) + '...' // 80자를 초과하면 잘라내고 "..." 추가
                    : combinedMessage

            console.log(`Combined Commit Message: ${finalMessage}`)
        }

        // 비동기 함수로 Git pull 및 빌드 처리
        if (branch == 'dev') {
            handleGitPullAndBuildWorkerDev(finalMessage)
        } else if (branch == 'main') {
            handleGitPullAndBuildWorkerLive(finalMessage)
        } else {
            console.error(`unknown branch ${branch}`)
        }
    } catch (e) {
        console.log(e)
    }
})

function getLogFolder() {
    const now = new Date()

    // 날짜와 시간을 포맷팅
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0') // 월은 0부터 시작하므로 +1
    const date = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    // 포맷팅된 문자열 생성
    return `Log_${year}-${month}-${date}-${hours}${minutes}${seconds}`
}

async function backupLogDev(basePath) {
    const logDirectory = `${basePath}/adobe_add_ons_hair_logs_dev/Server/${getLogFolder()}`

    try {
        const sourcePath = `${basePath}/adobe_add_ons_hair_logs_dev/Server/logs`
        await fs.access(sourcePath)

        // mv 명령 실행
        await execAsync(
            `mkdir -p ${logDirectory} && mv ${sourceFile} ${logDirectory}`
        )
        console.log(`File moved to ${targetDirectory}`)
    } catch (error) {
        if (error.code === 'ENOENT') {
            return
        } else {
            console.error('An error occurred:', error)
        }
    }
}

async function backupLogLive(basePath) {
    const logDirectory = `${basePath}/adobe_add_ons_hair_logs/Server/${getLogFolder()}`

    try {
        const sourcePath = `${basePath}/adobe_add_ons_hair_logs/Server/logs`
        await fs.access(sourcePath)

        // mv 명령 실행
        await execAsync(
            `mkdir -p ${logDirectory} && mv ${sourceFile} ${logDirectory}`
        )
        console.log(`File moved to ${targetDirectory}`)
    } catch (error) {
        if (error.code === 'ENOENT') {
            return
        } else {
            console.error('An error occurred:', error)
        }
    }
}

// 비동기로 Git pull, 빌드 및 Slack 알림을 처리하는 함수
async function handleGitPullAndBuildWorkerDev(finalMessage) {
    console.log(`handleGitPullAndBuildWorkerDev`)

    const basePath = '/home/ubuntu/adobeaddon'

    console.log(`handleGitPullAndBuildWorkerDev phase 1`)

    try {
        await execCommand('pm2 stop adobe_add_ons_hair_dev')
        await execCommand('pm2 delete adobe_add_ons_hair_dev')
        //await backupLog(basePath);
    } catch (err) {
        console.warn(`Error ignorable during build: ${err.message}`)
    }

    console.log(`handleGitPullAndBuildWorkerDev phase 2`)
    try {
        await backupLogDev(basePath)
    } catch (err) {
        console.warn(`Error ignorable during build: ${err.message}`)
    }

    console.log(`handleGitPullAndBuildWorkerDev phase 3`)

    try {
        await execCommand(`
      cd ${basePath} &&
      rm -rf adobe_add_ons_hair_dev &&
      git clone -b dev git@github.com:must-games/adobe_add_ons_hair.git adobe_add_ons_hair_dev &&
      cd adobe_add_ons_hair_dev/Server &&
      npm i &&
      npm run build &&
      pm2 start ecosystem_dev.config.cjs`)

        console.log('✅ (dev)Deployment process completed successfully.')

        // Slack에 성공 메시지 전송
        await sendSlackNotification(
            `:adobe_flash: :white_check_mark: (dev) Build and deployment succeeded for adobe_add_ons_hair Backend
       ${finalMessage}
      `
        )
    } catch (err) {
        console.error(`❌ (dev)Deployment failed: ${err.message}`)

        // Slack에 실패 메시지 전송
        await sendSlackNotification(
            `:adobe_flash: :x:  (dev)Build failed for adobe_add_ons_hair: ${err.message}`
        )
    }
}

async function handleGitPullAndBuildWorkerLive(finalMessage) {
    console.log(`handleGitPullAndBuildWorkerLive`)

    const basePath = '/home/ubuntu/adobeaddon'

    console.log(`handleGitPullAndBuildWorkerLive phase 1`)
    try {
        await execCommand('pm2 stop adobe_add_ons_hair')
        await execCommand('pm2 delete adobe_add_ons_hair')
        //await backupLog(basePath);
    } catch (err) {
        console.warn(`Error ignorable during build: ${err.message}`)
    }

    console.log(`handleGitPullAndBuildWorkerLive phase 2`)
    try {
        await backupLogLive(basePath)
    } catch (err) {
        console.warn(`Error ignorable during build: ${err.message}`)
    }

    console.log(`handleGitPullAndBuildWorkerLive phase 3`)
    try {
        await execCommand(`
      cd ${basePath} &&
      rm -rf adobe_add_ons_hair &&
      git clone -b main git@github.com:must-games/adobe_add_ons_hair.git adobe_add_ons_hair &&
      cd adobe_add_ons_hair/Server &&
      npm i &&
      npm run build &&
      pm2 start ecosystem.config.cjs`)

        console.log('✅ (live)Deployment process completed successfully.')

        // Slack에 성공 메시지 전송
        await sendSlackNotification(
            `:adobe_flash: :white_check_mark: (live) Build and deployment succeeded for adobe_add_ons_hair Backend
       ${finalMessage}
      `
        )
    } catch (err) {
        console.error(`❌ (live)Deployment failed: ${err.message}`)

        // Slack에 실패 메시지 전송
        await sendSlackNotification(
            `:adobe_flash: :x:  (live)Build failed for adobe_add_ons_hair: ${err.message}`
        )
    }
}

// 비동기로 exec 명령어를 처리하는 함수
function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error: ${err.message}`)
                reject(err)
                return
            }

            console.log(`stdout: ${stdout}`)
            console.error(`stderr: ${stderr}`)
            resolve(stdout)
        })
    })
}

// 비동기로 Slack 알림을 보내는 함수
function sendSlackNotification(message) {
    console.log(`slack message = ${message}`)
    return axios
        .post(
            'https://hooks.slack.com/services/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',
            {
                text: message,
                username: 'Build Bot',
                icon_emoji: ':robot_face:',
            }
        )
        .then(() => {
            console.log('Slack notification sent')
        })
        .catch((error) => {
            console.error(`Slack notification failed: ${error.message}`)
        })
}

app.listen(7781, () => {
    console.log('Listening for Webhook on port 7781')
})
