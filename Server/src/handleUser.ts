import { Request, Response } from 'express'

import { isDebugLog } from './config'
import logger from './log'
import { prisma } from './database'
import { getUser } from './user'
import { logToDB } from './dbLog'
import { LogLevel } from '@prisma/client'

export async function handleUserAccess(req: Request, res: Response) {
    if (isDebugLog) {
        logger.debug(`/user-access`)
    }

    try {
        const userId = req.body.userId

        await logToDB(userId, LogLevel.DEBUG, 'USER', 'ACCESS', '')

        let user = await getUser(userId)
        if (!user) {
            logger.error(`handleUserAccess something wrong ${userId}`)
            res.status(500).json({ success: false })
            return
        }

        res.send({ success: true, user: user })
        return
    } catch (e) {
        logger.error(`/user-access e=${e}`)
    }

    res.status(500).json({ success: false })
}

export async function handleGetUser(req: Request, res: Response) {
    if (isDebugLog) {
        logger.debug(`/user-get`)
    }

    try {
        const userId = req.body.userId
        if (isDebugLog) {
            logger.debug(`handleGetUser userId=${userId}`)
        }

        let user = await getUser(userId)

        if (!user) {
            logger.error(`handleGetUser something wrong ${userId}`)
            res.status(500).json({ success: false })
            return
        }

        res.send({ success: true, user: user })
        return
    } catch (e) {
        logger.error(`/user-get e=${e}`)
    }
}

export async function handleTOSAgree(req: Request, res: Response) {
    if (isDebugLog) {
        logger.debug(`/user-agree-tos`)
    }

    try {
        const userId = req.body.userId
        if (isDebugLog) {
            logger.debug(`handleTOSAgree userId=${userId}`)
        }
        const isTOSAgreed = req.body.isTOSAgreed

        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                isTOSAgreed: isTOSAgreed,
            },
        })

        res.send({ success: true })
        return
    } catch (e) {
        logger.error(`/user-agree-tos e=${e}`)
    }
}

export async function handleClickImage(req: Request, res: Response) {
    if (isDebugLog) {
        logger.debug(`/user-click-image`)
    }

    try {
        const userId = req.body.userId
        if (isDebugLog) {
            logger.debug(`handleClickImage userId=${userId}`)
        }

        const dbUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        })

        if (!dbUser) {
            logger.error(`handleClickImage something wrong ${userId}`)
            res.status(500).json({ success: false })
            return
        }

        const imageGroud = req.body.imageGroud
        const imageId = req.body.imageId

        await logToDB(userId, LogLevel.DEBUG, 'USER', 'CLICK_IMAGE', imageId)
        await logToDB(userId, LogLevel.DEBUG, 'USER', 'CLICK_IMAGE_GROUP', imageGroud)

        await prisma.imageLog.create({
            data: {
                userId: userId,
                imageGroup: imageGroud,
                imageId: imageId,
            },
        })

        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                imageUsedCountTotal: dbUser.imageUsedCountTotal + 1,
                imageUsedCountToday: dbUser.imageUsedCountToday + 1,
            },
        })

        res.send({ success: true })
        return
    } catch (e) {
        logger.error(`/user-get e=${e}`)
    }
}
