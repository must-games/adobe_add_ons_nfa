import { Express } from 'express'
const multer = require('multer')

import {
    handleCreateImageGen,
    handleImageGen,
    handleImageList,
    handleCompletedImageList,
    handleImageGenCancel,
    handleDeleteWork,
    handleImageGetFile,
} from './handleImage'

import { handleUserAccess, handleGetUser } from './handleUser'
import { handleLog } from './handleLog'

const upload = multer()

export function setupRoutes(app: Express): void {
    app.post('/work-delete', handleDeleteWork)
    app.post('/image-list', handleImageList)
    app.post('/image-completed-list', handleCompletedImageList)
    app.post('/image-create-gen', handleCreateImageGen)
    app.post('/image-gen', upload.single('sourceImageFile'), handleImageGen)
    app.post('/image-gen-cancel', handleImageGenCancel)
    app.post('/image-get', handleImageGetFile)
    
    app.post('/user-access', handleUserAccess)
    app.post('/user-get', handleGetUser)

    app.post('/log', handleLog)
}
