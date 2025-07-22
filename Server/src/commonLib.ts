import fs from 'fs'
import path from 'path'

import * as crypto from 'crypto'
import axios from 'axios'

import {
    SERVER_TYPE,
    SERVER_TAG,
    VENDOR,
    isDebugLog,
} from './config'
import { prisma } from './database'
import logger from './log'

export async function downloadFile(
    fileUrl: string,
    savePath: string
): Promise<Boolean> {
    try {
        console.log(fileUrl)
        const response = await axios.get(fileUrl, {
            responseType: 'stream',
        })

        const buffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = []
            response.data.on('data', (chunk: Buffer) => chunks.push(chunk))
            response.data.on('end', () => resolve(Buffer.concat(chunks)))
            response.data.on('error', reject)
        })

        const saveTo = `${savePath}`
        if (isDebugLog) {
            logger.debug(`downloadFile ${saveTo}`)
        }
        await fs.promises.writeFile(saveTo, buffer)
        return true
    } catch (error) {
        console.error(`Error downloading file: ${error}`)
    }

    return false
}

export function deleteDirectorySync(directoryPath: string) {
    try {
        fs.rmSync(directoryPath, { recursive: true, force: true })
        return true
    } catch (error) {
        logger.error(
            `deleteDirectorySync path=${directoryPath} error: ${error}`
        )
        return false
    }
}

function getBaseOriginalImagePath() {
    return `./original_images`
}

export function getCategoryData() {
    const filepath = getBaseOriginalImagePath() + '/category.json'

    //const absolutePath = path.resolve(filepath)
    //console.log(absolutePath)

    try {
        // 파일이 존재하는지 확인
        if (!fs.existsSync(filepath)) {
            console.error(`Category file not found: ${filepath}`)
            return null
        }

        // 파일 읽기
        const fileContent = fs.readFileSync(filepath, 'utf8')

        // JSON으로 파싱
        const categoryData = JSON.parse(fileContent)

        return categoryData
    } catch (error) {
        console.error(`Error reading category data: ${error}`)
        return null
    }
}

let gCategoryData: Record<string, string> = {}
export function initCategoryData() {
    gCategoryData = {}

    const filepath = getBaseOriginalImagePath() + '/category.json'
    const categoryData = getCategoryData()
    if (!categoryData || !categoryData['category_list']) {
        logger.error(
            'Failed to initialize category data: Invalid category data format'
        )
        return
    }

    categoryData['category_list'].forEach((category: string) => {
        categoryData[category].forEach(
            (item: { key: string; path: string }) => {
                gCategoryData[item.key] = item.path
                logger.debug(
                    `initCategoryData key=${item.key} path=${item.path}`
                )
            }
        )
    })
}

export async function calculateMD5(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5')
        const stream = fs.createReadStream(filePath)

        stream.on('data', (data) => hash.update(data))
        stream.on('end', () => resolve(hash.digest('hex')))
        stream.on('error', (err) => reject(err))
    })
}

async function readChecksumFile(checksumFilePath: string): Promise<string> {
    try {
        if (!fs.existsSync(checksumFilePath)) {
            return ''
        }

        const content = fs.readFileSync(checksumFilePath, 'utf-8')
        return content
    } catch (error) {}

    return ''
}

/**
 * 지정된 작업을 최대 재시도 횟수까지 실행
 * @param fn 실행할 비동기 함수
 * @param args 함수 인자
 * @returns 성공 시 결과값, 실패 시 예외 발생
 */
export async function commonRetry<T>(
    fn: (...args: any[]) => Promise<T>,
    args: any[],
    retries: number = 3
): Promise<boolean> {
    let attempt = 0
    while (attempt < retries) {
        try {
            const ret = await fn(...args)
            if (ret == true) {
                return true
            }

            attempt++
            if (attempt >= retries) {
                return false
            }
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed: ${error}`)
            attempt++
            if (attempt >= retries) {
                return false
            }
        }
    }
    return false
}
