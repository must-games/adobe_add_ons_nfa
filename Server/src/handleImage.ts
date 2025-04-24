import { v4 } from 'uuid'
import { Request, Response } from 'express'

import { getWorkList } from './workFunc'
import { STORAGE_BUCKET, isDebugLog } from './config'
import logger from './log'
import {
    objectStorageUploadFile,
    GetObjectStorageUrl,
} from './objectStorageWrapper'
import { prisma } from './database'
import { addImageGeneratedCount } from './user'

interface MulterRequest extends Request {
    file?: any
}

export async function handleDeleteWork(req: Request, res: Response) {
    if (isDebugLog) {
        logger.debug(`/work-delete`)
    }

    try {
        const userId = req.body.userId
        const workId = req.body.workId

        if (isDebugLog) {
            logger.debug(`userId=${userId} workId=${workId}`)
        }

        await prisma.work.delete({
            where: { id: workId, userId: userId },
        })

        //TODO: object storage에서도 삭제.

        res.send({ success: true })
        return
    } catch (e) {
        logger.error(`/image-list e=${e}`)
    }

    res.status(500).json({ success: false })
}

export async function handleCompletedImageList(req: Request, res: Response) {
    if (isDebugLog) {
        logger.debug(`/image-completed-list`)
    }

    try {
        const userId = req.body.userId

        if (isDebugLog) {
            logger.debug(`userId=${userId}`)
        }

        const resultList = await getWorkList(userId, -1, 'COMPLETED')

        res.send({ success: true, statusList: resultList })
        return
    } catch (e) {
        logger.error(`/image-list e=${e}`)
    }

    res.status(500).json({ success: false })
}

export async function handleImageList(req: Request, res: Response) {
    if (isDebugLog) {
        logger.debug(`/image-list`)
    }

    try {
        const userId = req.body.userId
        const workId = req.body.workId || -1

        if (isDebugLog) {
            logger.debug(`userId=${userId}`)
        }

        const resultList = await getWorkList(userId, workId, '')

        res.send({ success: true, workList: resultList })
        return
    } catch (e) {
        logger.error(`/image-list e=${e}`)
    }

    res.status(500).json({ success: false })
}

export async function handleImageGenCancel(req: MulterRequest, res: Response) {
    if (isDebugLog) {
        logger.debug(`/image-gen-cancel`)
    }

    try {
        const userId = req.body.userId
        const workId = req.body.workId || -1

        if (isDebugLog) {
            logger.debug(`userId=${userId} workId=${workId}`)
        }

        const work = await prisma.work.findFirst({
            where: { id: workId, userId: userId },
        })

        if (work) {
            //이미 완료가 되어도 취소해버리자.
            if (work.status === 'COMPLETED') {
                const dbUser = await prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                })

                if (
                    dbUser &&
                    dbUser.imagesGeneratedToday > 0 &&
                    dbUser.imagesGeneratedTotal > 0
                ) {
                    if (isDebugLog) {
                        logger.debug(`work status=${work.status}`)
                        logger.debug(
                            `dbUser.imagesGeneratedToday=${dbUser.imagesGeneratedToday}`
                        )
                        logger.debug(
                            `dbUser.imagesGeneratedTotal=${dbUser.imagesGeneratedTotal}`
                        )
                    }

                    await prisma.user.update({
                        where: {
                            id: userId,
                        },
                        data: {
                            imagesGeneratedToday:
                                dbUser.imagesGeneratedToday - 1,
                            imagesGeneratedTotal:
                                dbUser.imagesGeneratedTotal - 1,
                        },
                    })
                }
            } else if (
                work.status == 'REQUESTCANCEL' ||
                work.status == 'CANCELED'
            ) {
                res.status(200).json({ success: true })
                return
            }
        }

        await prisma.work.update({
            where: { id: workId, userId: userId },
            data: {
                status: 'REQUESTCANCEL',
                updatedAt: new Date(),
            },
        })

        // 필요없다.
        // await prisma.requestCancelWork.create({
        //     data: {
        //         userId: userId,
        //         workId: workId,
        //         canceled: false,
        //     },
        // })

        res.status(200).json({ success: true })
        return
    } catch (e) {
        logger.error(`/image-gen-cancel e=${e}`)
    }

    res.status(500).json({ success: false })
}

export async function handleCreateImageGen(req: Request, res: Response) {
    if (isDebugLog) {
        logger.debug(`/image-create-gen`)
    }

    try {
        const userId = req.body.userId
        if (isDebugLog) {
            console.log(JSON.stringify(req.body, null, 2))
            console.log('파일 정보:', req.file)
        }

        const newWork = await prisma.work.create({
            data: {
                userId,
                result: '[]',
                description: '',
                imagePrefix: 'kstylo_hair',
                promptId: '',
                selectedImageKey: '',
                selectedHairColorKey: '',
                sourceImageInfo: JSON.stringify(''),
                status: 'CREATED',
            },
        })

        if (!newWork) {
            logger.error(`/image-create-gen create work failed`)
            res.status(500).json({ success: false })
            return
        }

        res.status(200).json({
            success: true,
            workId: newWork.id,
            resultPath: '',
        })
        return
    } catch (e) {
        logger.error(`/image-create-gen e=${e}`)
    }

    res.status(500).json({ success: false })
}

export async function handleImageGen(req: MulterRequest, res: Response) {
    if (isDebugLog) {
        logger.debug(`/image-gen`)
    }

    try {
        const userId = req.body.userId
        const workId = parseInt(req.body.workId || -1)
        if (isDebugLog) {
            console.log(JSON.stringify(req.body, null, 2))
            console.log('파일 정보:', req.file)
        }

        if (req.file == undefined || req.file == null) {
            logger.error(`/image-gen req.file is undefined or null`)
            res.status(500).json({ success: false })
            return
        }

        if (req.file) {
            const fileKey = `temp-input-images/${v4()}-${req.file.originalname}`
            const fileBuffer = Buffer.from(req.file.buffer)

            if (
                (await objectStorageUploadFile(
                    STORAGE_BUCKET,
                    fileKey,
                    fileBuffer
                )) == false
            ) {
                logger.error(`/image-gen req.objectStorageUploadFile failed`)
                res.status(500).json({ success: false })
                return
            }

            const resultPath = GetObjectStorageUrl(STORAGE_BUCKET, fileKey)
            const selectedImageKey = req.body.selectedImageKey
            const selectedHairColorKey = req.body.selectedHairColorKey

            const sourceImageInfo = {
                fileKey: req.file.originalname,
                path: resultPath,
            }

            if (workId <= 0) {
                const newWork = await prisma.work.create({
                    data: {
                        userId,
                        result: '[]',
                        description: '',
                        imagePrefix: 'kstylo_hair',
                        promptId: '',
                        selectedImageKey: selectedImageKey,
                        selectedHairColorKey: selectedHairColorKey,
                        sourceImageInfo: JSON.stringify(sourceImageInfo),
                        status: 'PENDING',
                    },
                })

                if (!newWork) {
                    logger.error(`/image-gen create work failed`)
                    res.status(500).json({ success: false })
                    return
                }

                //서버에서 처리
                //await addImageGeneratedCount(userId, 1)

                res.status(200).json({
                    success: true,
                    workId: newWork.id,
                    resultPath: resultPath,
                })
                return
            }

            const work = await prisma.work.findFirst({
                where: { id: workId, userId: userId },
            })

            if (!work) {
                logger.error(`/image-gen update not exist work ${workId}`)
                res.status(500).json({ success: false })
                return
            }

            if (work.status != 'CREATED') {
                if (isDebugLog) {
                    logger.debug(
                        `/image-gen work.status ${work.status} so pass`
                    )
                }
                //worker에서 처리.
                res.status(200).json({
                    success: true,
                    workId: work.id,
                    resultPath: '',
                })
                return
            }

            await prisma.work.update({
                where: {
                    userId: userId,
                    id: workId,
                    status: 'CREATED',
                },
                data: {
                    selectedImageKey: selectedImageKey,
                    selectedHairColorKey: selectedHairColorKey,
                    sourceImageInfo: JSON.stringify(sourceImageInfo),
                    status: 'PENDING',
                },
            })

            res.status(200).json({
                success: true,
                workId: work.id,
                resultPath: resultPath,
            })
            return
        }
    } catch (e) {
        logger.error(`/image-gen e=${e}`)
    }

    res.status(500).json({ success: false })
}

export async function handleImageGetFile(req: MulterRequest, res: Response) {
    if (isDebugLog) {
        console.log(`/image-get`)
    }

    try {
        const url = req.body.url

        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(
                `Failed to fetch: ${response.status} ${response.statusText}`
            )
        }

        const contentType =
            response.headers.get('Content-Type') || 'application/octet-stream'
        const arrayBuffer = await response.arrayBuffer()
        const base64Data = Buffer.from(arrayBuffer).toString('base64')

        if (isDebugLog) {
            console.log(
                `handleImageGetFile url=${url} contentType=${contentType}`
            )
        }

        res.status(200).json({
            success: true,
            contentType: contentType,
            data: base64Data,
        })
        return
    } catch (error) {
        console.error('Error downloading file:', error)
    }

    res.status(500).json({ success: false })
}
