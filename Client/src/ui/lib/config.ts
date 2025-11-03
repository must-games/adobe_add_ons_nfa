export const STORAGE_BUCKET = 'abodeaddon-ai-dev'
export const SERVER_TYPE = 'dev'
export const SERVER_TAG = 'abodeaddon-ai-base'
export const VENDOR = 'mustg'


export let BACK_END_URL = 'https://tos.nfa.mustg.kr:2121'

export let isDebugLog = false
if (process.env.DEBUG === 'true') {
    isDebugLog = true
}

if (isDebugLog) {
    console.log(`process.env.SERVER_TYPE=${process.env.SERVER_TYPE}`)
    console.log(`process.env.DEBUG=${process.env.DEBUG}`)    
}

if (process.env.SERVER_TYPE === 'distribution') {
    BACK_END_URL = 'https://tos.nfa.mustg.kr:443'
} else {
    //BACK_END_URL = 'https://tos.nfa.mustg.kr:5001'
    BACK_END_URL = 'https://kakaogpu-test.mustg.kr:5001'
}

//BACK_END_URL = 'http://localhost:2121'
//BACK_END_URL = 'https://tos.nfa.mustg.kr:443'

export const DAILY_IMAGE_GENERATION_LIMIT = parseInt(
    process.env.DAILY_IMAGE_GENERATION_LIMIT || '-1'
)

console.log(`BACK_END_URL=${BACK_END_URL}`)