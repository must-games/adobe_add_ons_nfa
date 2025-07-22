import express from 'express'
import https from 'https'
import fs from 'fs'
const cors = require('cors')
import { Request, Response } from 'express'

import {
    SERVER_TYPE,
    SERVER_TAG,
    VENDOR,
    isDebugLog,
} from './config'
import logger from './log'
import { setupRoutes } from './setupRoutes'

const app = express()
const PORT = process.env.SERVER_PORT || 2111

const options = {
    //key: fs.readFileSync('/etc/letsencrypt/live/tos.nfa.mustg.kr/privkey.pem'),
    //cert: fs.readFileSync('/etc/letsencrypt/live/tos.nfa.mustg.kr/fullchain.pem'),
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem'),
}

app.use(cors())
app.use(express.json())

app.get('/', async (req: Request, res: Response) => {
    if (isDebugLog) {
        res.send('🚀 Hello from Express Server!')
    }
})

setupRoutes(app)

const serverInfo = () => {
    logger.info(`SERVER_TYPE=${SERVER_TYPE}`)
    logger.info(`SERVER_TAG=${SERVER_TAG}`)
    logger.info(`VENDOR=${VENDOR}`)
    logger.info(`isDebugLog=${isDebugLog}`)
    logger.info(`DATABASE_URL=${process.env.DATABASE_URL}`)
    logger.info(`CLOUD_TYPE=${process.env.CLOUD_TYPE}`)
    logger.info(`NODE_ENV=${process.env.NODE_ENV}`)
}

if (process.env.NODE_ENV === 'development') {
    app.listen(PORT, () => {
        logger.info('-------------------------------------------')
        logger.info(`🚀 Server running onp http://localhost:${PORT}`)
        logger.info('-------------------------------------------')

        serverInfo()

        logger.info('-------------------------------------------')
    })
} else {
    https.createServer(options, app).listen(PORT, () => {
        logger.info('-------------------------------------------')
        logger.info(`🚀 Server running on https://domain:${PORT}`)
        logger.info('-------------------------------------------')

        serverInfo()

        logger.info('-------------------------------------------')
    })
}

export default app
