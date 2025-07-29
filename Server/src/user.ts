import logger from './log'
import { prisma } from './database'
import { isDebugLog } from './config'

export type userData = {
    id: string | null
    imageUsedCountTotal: number | 0
    imageUsedCountToday: number | 0
    isTOSAgreed: boolean | false
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
            //imageUsedCountToday: 0,
        }
    } else {
        updateData = { lastLoginAt: new Date() }
    }

    return await prisma.user.update({
        where: { id: userId },
        data: updateData,
    })
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
        } else {
        }

        user = await checkNewDayAndResetData(userId, user)

        // checkNewDayAndResetData에서 update가 안되나...
        user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        })

        const userData = {
            id: user?.id || null,
            imageUsedCountToday: user?.imageUsedCountToday || 0,
            imageUsedCountTotal: user?.imageUsedCountTotal || 0,
            isTOSAgreed: user?.isTOSAgreed || false,
        }

        return userData
    } catch (e) {
        logger.error(`getUser error ${e}`)
    }

    return null
}
