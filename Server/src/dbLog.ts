import { prisma } from './database'
import { LogLevel } from '@prisma/client'
import { isDebugLog } from './config'

export async function logToDB(
    userId: string,
    level: LogLevel,
    event: string,
    tag: string,
    message: string,
    params?: Record<string, any>
) {
    try {
        if (isDebugLog == false) {
            if (level == LogLevel.DEBUG) {
                return
            }
        }

        await prisma.log.create({
            data: {
                userId: userId,
                level: level,
                event: event,
                tag: tag,
                message: message,
                params: params ?? {},
            },
        })
    } catch (err) {
        console.error('[logToDB] Failed to write log:', err)
    }
}
