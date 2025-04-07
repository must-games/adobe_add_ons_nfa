import axios from 'axios'

import logger from './log'
import { isDebugLog } from './config'
import { kakaoObjectList } from './kakaoObjectStorageClient'
import { STORAGE_BUCKET } from './config'

export const KAKAO_API_URL = 'https://iam.kakaocloud.com/identity/v3' // 카카오 클라우드 IAM API URL
const KAKAO_ACCESS_KEY = process.env.KAKAO_ACCESS_KEY // 카카오 클라우드 액세스 키
const KAKAO_SECRET_KEY = process.env.KAKAO_SECRET_KEY // 카카오 클라우드 보안 키
const KAKAO_USER_ID = process.env.KAKAO_USER_ID
export const KAKAO_PROJECT_ID = process.env.KAKAO_PROJECT_ID

const isKakaoTokenValid = async (authToken: string) => {
    const ret = await kakaoObjectList(authToken, STORAGE_BUCKET, '', 1)
    return ret.success
}

// https://docs.kakaocloud.com/tutorial/storage/object-storage-s3-api
// https://docs.kakaocloud.com/start/api-preparation#get-api-authentication-token
// 기본적으로 API 인증 토큰은 발급 후 12시간 이후 만료되며,
// 상황에 따라 12시간 이내라도 변경되거나 만료될 수 있습니다. 이 경우, 새로운 토큰을 발급받아야 합니다.
let cachedAuthToken: any = null
let authTokenExpireTime = 0
const _getKakaoAuthToken = async () => {
    try {
        const now = Date.now()
        if (cachedAuthToken && now < authTokenExpireTime) {
            return cachedAuthToken
        }

        console.log(`_getKakaoAuthTokenaoAuthToken 1`)
        const response = await axios.post(
            `${KAKAO_API_URL}/auth/tokens`,
            {
                auth: {
                    identity: {
                        methods: ['application_credential'],
                        application_credential: {
                            id: KAKAO_ACCESS_KEY,
                            secret: KAKAO_SECRET_KEY,
                        },
                    },
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        if (isDebugLog) {
            logger.debug(JSON.stringify(response.headers, null, 2))
        }

        const authToken = response.headers['x-subject-token']
        if (isDebugLog) {
            console.log('Auth Token:', authToken)
        }

        cachedAuthToken = authToken
        authTokenExpireTime = now + 3 * 60 * 60 * 1000 // 3시간
        return authToken
    } catch (error) {
        logger.error('getKakaoAuthToken ' + error)
    }

    return ''
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export const getKakaoAuthToken = async () => {
    try {
        let remainTryCount = 3
        while (remainTryCount > 0) {
            const authToken = await _getKakaoAuthToken()

            if (await isKakaoTokenValid(authToken)) {
                return authToken
            }
            
            logger.info(`getKakaoAuthToken invalid token so retry remainTryCount=${remainTryCount}`)

            await delay(100)
            --remainTryCount
        }
    } catch (error) {
        logger.error('getKakaoAuthToken ' + error)
    }

    throw new Error('getKakaoAuthToken failed')
}

let cachedCredentials: any = null
let credentialsExpireTime = 0
export const getS3Credentials = async (authToken: string) => {
    try {
        const now = Date.now()
        if (cachedCredentials && now < credentialsExpireTime) {
            return cachedCredentials
        }

        const response = await axios.post(
            `${KAKAO_API_URL}/users/${KAKAO_USER_ID}/credentials/OS-EC2`,
            {
                tenant_id: KAKAO_PROJECT_ID,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': authToken,
                },
            }
        )

        if (isDebugLog) {
            logger.debug(JSON.stringify(response.data, null, 2))
        }

        const { access, secret } = response.data.credential
        cachedCredentials = { access, secret }
        credentialsExpireTime = now + 3 * 60 * 60 * 1000 // 3시간
        // if (isDebugLog) {
        //     console.log('S3 Access Key:', access)
        //     console.log('S3 Secret Key:', secret)
        // }
        return { access, secret }
    } catch (error) {
        logger.error('getS3Credentials ' + error)
    }
}
