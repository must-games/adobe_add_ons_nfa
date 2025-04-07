export const STORAGE_BUCKET = 'abodeaddon-ai-dev'
export const SERVER_TYPE = 'dev'
export const SERVER_TAG = 'abodeaddon-ai-base'
export const VENDOR = 'mustg'

//export const BACK_END_URL = 'http://localhost:2111'
export let BACK_END_URL = 'https://kakaogpu-test.mustg.kr:2111'

export let isDebugLog = false
if (process.env.DEBUG === 'true') {
    isDebugLog = true
}

if (isDebugLog) {
    console.log(`process.env.PACKAGE_TYPE=${process.env.PACKAGE_TYPE}`)
    console.log(`process.env.DEBUG=${process.env.DEBUG}`)    
}

if (process.env.PACKAGE_TYPE === 'distribution') {
    BACK_END_URL = 'https://kakaogpu-test.mustg.kr:2112'
} else {
    BACK_END_URL = 'https://kakaogpu-test.mustg.kr:2111'
}

console.log(`BACK_END_URL=${BACK_END_URL}`)