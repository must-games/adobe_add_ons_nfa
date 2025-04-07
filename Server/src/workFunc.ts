import { prisma } from './database'

import logger from './log'
import { isDebugLog, STORED_IMAGE_EXPIRATION_DAYS } from './config'

export async function getWorkList(
    userId: string,
    workId: number,
    status: string
) {
    const expirationDate = new Date()
    expirationDate.setDate(
        expirationDate.getDate() - STORED_IMAGE_EXPIRATION_DAYS
    )

    const whereCondition: any = {
        userId,
        ...(workId >= 0 && { id: workId }),
        ...(status !== undefined &&
            status !== null &&
            status !== '' && { status }),
        createdAt: {
            gte: expirationDate, // 만료 날짜보다 최신 레코드만 포함
        },
    }

    try {
        const workList = await prisma.work.findMany({
            where: whereCondition,
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                result: true,
                status: true,
            },
            orderBy: {
                updatedAt: 'desc', // updateAt 필드를 기준으로 내림차순 정렬
            },
        })

        if (isDebugLog) {
            logger.debug(
                `getWorkStatusList workList=${JSON.stringify(workList)}`
            )
        }

        if (!workList) {
            return []
        }

        return workList
    } catch (err) {
        logger.error(`getCompletedImageList err=${err}`)
    }
}
