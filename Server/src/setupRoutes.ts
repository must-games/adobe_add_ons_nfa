import { Express } from 'express'
const multer = require('multer')

import { handleUserAccess, handleGetUser } from './handleUser'
import { handleLog } from './handleLog'

const upload = multer()

export function setupRoutes(app: Express): void {    
    app.post('/user-access', handleUserAccess)
    app.post('/user-get', handleGetUser)

    app.post('/log', handleLog)
}
