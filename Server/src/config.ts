require('dotenv-flow').config()

const LOG_LEVEL = process.env.LOG_LEVEL || ''
export let isDebugLog = false
if (LOG_LEVEL == 'Debug') {
    isDebugLog = true
}

if (isDebugLog) {
    console.log(`DATABASE_URL=${process.env.DATABASE_URL}`)
}

export const SERVER_TYPE = process.env.SERVER_TYPE || 'dev'
export const SERVER_TAG = process.env.SERVER_TAG || ''
export const VENDOR = process.env.VENDOR || ''
