import {
    S3Client,
    DeleteObjectCommand,
    PutObjectCommand,
    GetObjectCommand,
    ObjectCannedACL,
    PutObjectCommandInput,
} from '@aws-sdk/client-s3'

import { GetS3Region, GetS3Endpoint } from './objectStorageWrapper'
import { isDebugLog } from './config'

export const getS3Option = (
    accessKey: string,
    secretKey: string,
    bucketName: string
) => {
    let s3Option = {
        region: GetS3Region(),
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
        },
        ...(process.env.CLOUD_TYPE === 'kakaocloud' && {
            endpoint: GetS3Endpoint(bucketName),
            forcePathStyle: true,
        }),
    }

    return s3Option
}

export const awsUploadFile = async (
    accessKey: string,
    secretKey: string,
    bucketName: string,
    fileName: string,
    fileBuffer: Buffer
) => {
    // if (isDebugLog) {
    //     console.log(`awsUploadFile ${accessKey}`)
    //     console.log(`awsUploadFile ${secretKey}`)
    //     console.log(`awsUploadFile ${bucketName}`)
    //     console.log(`awsUploadFile ${fileName}`)
    // }

    const s3 = new S3Client(getS3Option(accessKey, secretKey, bucketName))

    try {
        const params: PutObjectCommandInput = {
            Bucket: bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: 'application/octet-stream',
        }

        if (process.env.CLOUD_TYPE === 'aws') {
            params.ACL = 'public-read' as ObjectCannedACL
        }

        const command = new PutObjectCommand(params)
        const uploadResult = await s3.send(command)
        // if (isDebugLog) {
        //     console.log(
        //         'awsUploadFile:' + JSON.stringify(uploadResult, null, 2)
        //     )
        // }

        return { success: true }
    } catch (e) {
        if (e instanceof Error) {
            console.error('Error message:', e.message) // 에러 메시지
            //console.error('Stack trace:', e.stack) // 스택 추적 정보
        } else {
            console.error('Unknown error:', e) // 에러 객체가 아니면 그대로 출력
        }
        throw e
    }

    return { success: false, message: '' }
}

export const deleteFileFromS3 = async (
    accessKey: string,
    secretKey: string,
    bucketName: string,
    fileName: string
) => {
    const s3 = new S3Client(getS3Option(accessKey, secretKey, bucketName))

    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: fileName,
        })
        const deleteResult = await s3.send(command)
        if (isDebugLog) {
            console.log(
                'deleteFileFromS3:' + JSON.stringify(deleteResult, null, 2)
            )
        }
    } catch (e) {
        console.error(`deleteFileFromS3 e=${e}`)
        throw e
    }
}

export const downloadObject = async (
    accessKey: string,
    secretKey: string,
    bucketName: string,
    key: string,
    downloadPath: string
): Promise<Buffer | undefined> => {
    const s3 = new S3Client(getS3Option(accessKey, secretKey, bucketName))

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName, // S3 버킷 이름
            Key: key, // 다운로드할 객체의 키
        })

        const response = await s3.send(command)

        if (response.Body) {
            const chunks: Uint8Array[] = []

            // 응답 Body를 스트림으로 처리
            for await (const chunk of response.Body as any as AsyncIterable<Uint8Array>) {
                chunks.push(chunk)
            }

            // Uint8Array 배열을 Buffer로 병합하여 반환
            return Buffer.concat(chunks)
        } else {
            console.error('No content in response Body.')
        }
    } catch (error) {
        console.error('Error downloading object:', error)
    }
}
