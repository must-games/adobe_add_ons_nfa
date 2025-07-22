import { Request, Response } from 'express'

import logger from './log'
import { logToDB } from './dbLog'
import { LogLevel } from '@prisma/client'
import { isDebugLog } from './config'

export async function handleLog(req: Request, res: Response) {
    if (isDebugLog) {
        logger.debug(`/log`)
    }

    try {
        const userId = req.body.userId
        const event = req.body.event
        const tag = req.body.tag
        const message = req.body.message

        await logToDB(userId, LogLevel.INFO, event, tag, message)

        res.status(200).json({
            success: true,
        })
        return
    } catch (e) {
        logger.error(`/log e=${e}`)
    }

    res.status(200).json({ success: false })
}
