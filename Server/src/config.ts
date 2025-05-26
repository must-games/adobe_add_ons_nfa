require('dotenv-flow').config()

export const WorkerCheckInterval = parseInt(
    process.env.WORKER_CHECK_INTERVAL || '1000'
)

export const BASE_FLUX_URL =
    process.env.BASE_FLUX_URL || 'http://localhost:8188'

const LOG_LEVEL = process.env.LOG_LEVEL || ''
export let isDebugLog = false
if (LOG_LEVEL == 'Debug') {
    isDebugLog = true
}

if (isDebugLog) {
    console.log(`DATABASE_URL=${process.env.DATABASE_URL}`)
    console.log(`BASE_FLUX_URL=${BASE_FLUX_URL}`)
}

export const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'modoolorabeta'
export const SERVER_TYPE = process.env.SERVER_TYPE || 'dev'
export const SERVER_TAG = process.env.SERVER_TAG || ''
export const VENDOR = process.env.VENDOR || ''
export const COMFYUI_PATH = process.env.COMFYUI_PATH || ''

export const STORED_IMAGE_EXPIRATION_DAYS = parseInt(
    process.env.STORED_IMAGE_EXPIRATION_DAYS || '7'
)

export const DAILY_IMAGE_GENERATION_LIMIT = parseInt(
    process.env.DAILY_IMAGE_GENERATION_LIMIT || '3'
)

export const DAILY_IMAGE_GENERATION_RESET =
    process.env.DAILY_IMAGE_GENERATION_RESET === 'true' ? true : false
