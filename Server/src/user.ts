import logger from './log'
import { prisma } from './database'
import { isDebugLog, DAILY_IMAGE_GENERATION_RESET } from './config'

export type userData = {
    id: string | null
    imagesGeneratedToday: number | 0
    imagesGeneratedTotal: number | 0
}

const isNewDay = (lastResetDate: Date | null): boolean => {
    const nowUTC = new Date()
    if (!lastResetDate) return true // If no previous reset, treat as new day

    // Compare dates in UTC, ignoring time
    const lastResetUTC = new Date(
        Date.UTC(
            lastResetDate.getUTCFullYear(),
            lastResetDate.getUTCMonth(),
            lastResetDate.getUTCDate()
        )
    )
    const todayUTC = new Date(
        Date.UTC(
            nowUTC.getUTCFullYear(),
            nowUTC.getUTCMonth(),
            nowUTC.getUTCDate()
        )
    )

    return todayUTC > lastResetUTC
}

export const checkNewDayAndResetData = async (userId: any, dbUser: any) => {
    let updateData = {}
    if (isNewDay(dbUser.lastResetDate)) {
        if (isDebugLog) {
            console.log(`checkNewDayAndResetData user ${userId} new day`)
        }

        updateData = {
            lastResetDate: new Date(),
            imagesGeneratedToday: 0,
        }
    } else {
        updateData = { lastLoginAt: new Date() }
    }

    return await prisma.user.update({
        where: { id: userId },
        data: updateData,
    })
}

export const addImageGeneratedCount = async (userId: any, count: number) => {
    if (!userId) {
        logger.error(`addImageGeneratedCount userId is ${userId}`)
        return
    }

    try {
        const dbUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        })

        if (!dbUser) {
            logger.error(`addImageGeneratedCount not exists user ${userId}`)
            return
        }

        if (isDebugLog) {
            logger.debug(
                `addImageGeneratedCount userId: ${userId}, count: ${count}`
            )
        }

        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                imagesGeneratedToday: dbUser.imagesGeneratedToday + count,
                imagesGeneratedTotal: dbUser.imagesGeneratedTotal + count,
            },
        })
    } catch (e) {
        logger.error(`addImageGeneratedCount error ${e}`)
    }
}

export async function getActiveWorkCount(userId: string): Promise<number> {
    try {
        // ERROR나 COMPLETED가 아닌 작업 수 조회
        const count = await prisma.work.count({
            where: {
                userId: userId,
                NOT: {
                    status: {
                        in: ['ERROR', 'COMPLETED', 'CANCELED', 'REQUESTCANCEL'],
                    },
                },
            },
        })

        if (isDebugLog) {
            logger.debug(`User ${userId} has ${count} active works`)
        }

        return count
    } catch (err) {
        logger.error(`getActiveWorkCount error for user ${userId}: ${err}`)
        return 0 // 오류 발생 시 0 반환
    }
}

export const getUser = async (userId: any) => {
    try {
        let user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        })

        if (user == null || user == undefined) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    createdAt: new Date(),
                    lastLoginAt: new Date(),
                },
            })

            logger.info(`getUser New user created: ${userId}`)
        } else if (DAILY_IMAGE_GENERATION_RESET) {
            user = await checkNewDayAndResetData(userId, user)
        }

        // checkNewDayAndResetData에서 update가 안되나...
        user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        })

        const workingCount = await getActiveWorkCount(userId)
        const userData = {
            id: user?.id || null,
            imagesGeneratedToday:
                user?.imagesGeneratedToday || 0 + workingCount,
            imagesGeneratedTotal: user?.imagesGeneratedTotal || 0,
        }

        return userData
    } catch (e) {
        logger.error(`getUser error ${e}`)
    }

    return null
}
