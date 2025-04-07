import { KAKAO_PROJECT_ID, KAKAO_API_URL } from './getKakaoFunc'
import logger from './log'
import { isDebugLog } from './config'

interface KakaoUploadResult {
    success: boolean
    message?: string
}

export const kakaoUploadFile = async (
    authToken: string,
    bucketName: string,
    fileName: string,
    fileBuffer: Buffer
): Promise<KakaoUploadResult> => {
    try {
        //aws s3가 nextjs에서 안먹는다. 대체왜 인지..

        //https://docs.kakaocloud.com/service/bss/object-storage/api/bss-api-os-object

        const account = KAKAO_PROJECT_ID as string

        const objectUrl = `https://objectstorage.kr-central-2.kakaocloud.com/v1/${account}/${bucketName}/${fileName}`

        if (isDebugLog) {
            console.log(`kakaoUploadFile objectUrl=${objectUrl}`)
            console.log(`kakaoUploadFile fileBuffer.length=${fileBuffer.length}`)
        }

        const response = await fetch(objectUrl, {
            method: 'PUT',
            headers: {
                'X-Auth-Token': authToken,
                'Content-Type': 'application/octet-stream',
                'Cache-Control': 'no-store',
            },
            body: fileBuffer,
        })

        if (isDebugLog) {
            console.log(`kakaoUploadFile response.ok=${response.ok}`)
        }

        if (!response.ok) {
            const respText = await response.text()
            return { success: false, message: respText }
        }

        return { success: true }
    } catch (error: any) {
        logger.error('Upload error:', error)
        return { success: false, message: error.message }
    }
}

export const kakaoDeleteUploadedFile = async (
    authToken: string,
    bucketName: string,
    fileName: string
) => {
    // curl --location --request DELETE 'https://objectstorage.{region_name}.kakaocloud.com/v1/{account}/{bucket_name}/{path}' \
    // --header 'X-Auth-Token: {x-auth-token}'

    try {
        const account = KAKAO_PROJECT_ID as string

        const objectUrl = `https://objectstorage.kr-central-2.kakaocloud.com/v1/${account}/${bucketName}/${fileName}`
        const response = await fetch(objectUrl, {
            method: 'DELETE',
            headers: {
                'X-Auth-Token': authToken,
                ContentType: 'application/octet-stream',
            },
        })

        if (!response.ok) {
            const respText = await response.text()
            return { success: false, message: respText }
        }

        return { success: true }
    } catch (error: any) {
        logger.error('delete error:', error)
        return { success: false, message: error.message }
    }
}

export const kakaoObjectList = async (
    authToken: string,
    bucketName: string,
    prefix: string,
    limit: number
) => {
    try {
        //curl --location --request GET 'https://objectstorage.{region_name}.kakaocloud.com/v1/{account}/{bucket_name}?format=json' \
        //--header 'X-Auth-Token: {x-auth-token}'
        const account = KAKAO_PROJECT_ID as string

        const objectUrl = `https://objectstorage.kr-central-2.kakaocloud.com/v1/${account}/${bucketName}?format=json&limit=${limit}&prefix=${prefix}`
        const response = await fetch(objectUrl, {
            method: 'GET',
            headers: {
                'X-Auth-Token': authToken,
                ContentType: 'application/octet-stream',
            },
        })

        if (!response.ok) {
            logger.error('kakaoObjectList error:', response.statusText)
            return { success: false, list: [] }
        }

        const ret = await response.json()
        return { success: true, list: ret }
    } catch (error: any) {
        logger.error('kakaoObjectList error:', error)
    }

    return { success: false, list: [] }
}
