import { Request, Response } from 'express'

import {
    DAILY_IMAGE_GENERATION_LIMIT,
    STORED_IMAGE_EXPIRATION_DAYS,
    isDebugLog,
} from './config'
import logger from './log'
import { prisma } from './database'
import { getUser } from './user'

export async function handleUserAccess(req: Request, res: Response) {
    if (isDebugLog) {
        logger.debug(`/user-access`)
    }

    try {
        const userId = req.body.userId

        if (isDebugLog) {
            logger.debug(`handleUserAccess userId=${userId}`)
        }

        let user = await getUser(userId)
        if (!user) {
            logger.error(`handleUserAccess something wrong ${userId}`)
            res.status(500).json({ success: false })
            return
        }

        const limitInfo = {
            DAILY_IMAGE_GENERATION_LIMIT: DAILY_IMAGE_GENERATION_LIMIT,
            STORED_IMAGE_EXPIRATION_DAYS: STORED_IMAGE_EXPIRATION_DAYS,
        }

        res.send({ success: true, user: user, limitInfo: limitInfo })
        return
    } catch (e) {
        logger.error(`/image-list e=${e}`)
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
        logger.error(`/image-list e=${e}`)
    }
}
