import { Express } from 'express'
const multer = require('multer')

import {
    handleUserAccess,
    handleGetUser,
    handleClickImage,
    handleTOSAgree,
} from './handleUser'
import { handleLog } from './handleLog'

const upload = multer()

export function setupRoutes(app: Express): void {
    app.post('/user-access', handleUserAccess)
    app.post('/user-get', handleGetUser)
    app.post('/user-click-image', handleClickImage)
    app.post('/user-agree-tos', handleTOSAgree)

    app.post('/log', handleLog)
}
