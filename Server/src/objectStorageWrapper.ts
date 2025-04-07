import { getKakaoAuthToken, getS3Credentials } from './getKakaoFunc'
import { kakaoUploadFile } from './kakaoObjectStorageClient'
import logger from './log'

export async function objectStorageUploadFile(
    bucketName: string,
    fileName: string,
    fileBuffer: Buffer
) {
    const authToken = await getKakaoAuthToken()

    if (!authToken) {
        logger.error('kakao auth failed!')

        return false
    }

    return await kakaoUploadFile(
        authToken,
        bucketName,
        fileName,
        fileBuffer
    )
}

export function GetObjectStorageUrl(bucketName: string, fileKey: string) {
    if (process.env.CLOUD_TYPE == 'kakaocloud') {
        return `https://objectstorage.kr-central-2.kakaocloud.com/v1/cccf2acbb0a74ae88e2d77e696b7be52/${bucketName}/${fileKey}`
    }

    //https://<버킷 이름>.s3.<리전>.amazonaws.com/<객체 키>
    return `${GetS3Endpoint(bucketName)}/${fileKey}`
}

export function GetS3Region() {
    return process.env.STORAGE_REGION || 'kr-central-2'
}

export function GetS3Endpoint(bucketName: string) {
    if (process.env.CLOUD_TYPE == 'kakaocloud') {
        return `https://objectstorage.${GetS3Region()}.kakaocloud.com`
    }

    return `https://${bucketName}.s3.${GetS3Region()}.amazonaws.com`
}