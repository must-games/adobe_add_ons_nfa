import {
    BACK_END_URL,
    isDebugLog,
    DAILY_IMAGE_GENERATION_LIMIT,
} from './config'

export async function userAccess(userId: string) {
    try {
        if (isDebugLog) {
            console.log(`userAccess userId=${userId}`)
        }

        const response = await fetch(BACK_END_URL + '/user-access', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId
            }),
        })

        if (response.ok) {
            const data = await response.json()
            return data
        } else {
            console.error(`Failed userAccess: ${response.status}`)
            return null
        }
    } catch (e) {
        console.error(`userAccess e=${e}`)

        return null
    }
}

export async function cancelGenerateImage(userId: string, workId: number) {
    try {
        if (isDebugLog) {
            console.log(`cancelGenerateImage userId=${userId} workId=${workId}`)
        }

        const response = await fetch(BACK_END_URL + '/image-gen-cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                workId,
            }),
        })

        if (response.ok) {
            const data = await response.json()
            return { success: true, message: data.message }
        } else {
            console.error(`Failed cancelGenerateImage: ${response.status}`)
            return { success: false, message: `${response.statusText}` }
        }
    } catch (e) {
        console.error(`cancelGenerateImage e=${e}`)

        return { success: false, message: `${e}` }
    }
}

export async function getUser(userId: string) {
    try {
        if (isDebugLog) {
            console.log(`getUser userId=${userId}`)
        }

        const response = await fetch(BACK_END_URL + '/user-get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
            }),
        })

        if (response.ok) {
            const data = await response.json()
            return data
        } else {
            console.error(`Failed getUser: ${response.status}`)
            return null
        }
    } catch (e) {
        console.error(`getUser e=${e}`)

        return null
    }
}

export async function createGenerateImage(userId: string) {
    const startTime = performance.now()

    try {
        if (isDebugLog) {
            console.log(`createGenerateImage userId=${userId}`)
        }

        const response = await fetch(BACK_END_URL + '/image-create-gen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
            }),
        })

        const executionTime = (performance.now() - startTime) / 1000

        if (isDebugLog) {
            console.log(
                `⏲️  createGenerateImage execution time : ${executionTime.toFixed(
                    3
                )}s`
            )
        }

        await logToServer(
            userId,
            'IMAGE',
            'CREATE',
            `time=${executionTime.toFixed(3)}s`
        )

        if (response.ok) {
            const data = await response.json()
            return data.workId
        } else {
            console.error(`Failed createGenerateImage: ${response.status}`)
            return -1
        }
    } catch (e) {
        console.error(`createGenerateImage e=${e}`)

        return -1
    }
}

export async function generateImage(
    userId: string,
    workId: number,
    selectedImageKey: string,
    file: File,
    selectedHairColorKey: string
) {
    const startTime = performance.now()

    try {
        if (isDebugLog) {
            console.log(`generateImage filename=${file.name}`)
            console.log(`generateImage selectedImageKey=${selectedImageKey}`)
        }

        const url = URL.createObjectURL(file)
        const blob = await fetch(url).then((response) => response.blob())
        URL.revokeObjectURL(url)

        const formData = new FormData()
        formData.append('userId', userId)
        formData.append('workId', workId.toString())
        formData.append('sourceImageFile', blob, file.name)
        formData.append('selectedImageKey', selectedImageKey)
        formData.append('selectedHairColorKey', selectedHairColorKey)

        const response = await fetch(BACK_END_URL + '/image-gen', {
            method: 'POST',
            body: formData,
        })

        if (response.ok) {
            const data = await response.json()

            const executionTime = (performance.now() - startTime) / 1000

            if (isDebugLog) {
                console.log(
                    `⏲️ generateImage response.ok execution time: ${executionTime.toFixed(
                        3
                    )}s`
                )
            }

            await logToServer(
                userId,
                'IMAGE',
                'GEN',
                `time=${executionTime.toFixed(3)}s`
            )

            return data.workId
        } else {
            console.error(
                `Failed to get generateImage with status: ${response.status}`
            )

            const executionTime = (performance.now() - startTime) / 1000
            if (isDebugLog) {
                console.log(
                    `⏲️  generateImage response: ${
                        response.status
                    } execution time: ${executionTime.toFixed(3)}s`
                )
            }

            await logToServer(
                userId,
                'IMAGE',
                'GEN_FAIL',
                `time=${executionTime.toFixed(3)}s status=${response.status}`
            )

            return -1
        }
    } catch (e) {
        console.error(`generateImage e=${e}`)

        const executionTime = (performance.now() - startTime) / 1000

        if (isDebugLog) {
            console.log(
                `⏲️  generateImage e execution time: ${executionTime.toFixed(
                    3
                )}s`
            )
        }

        await logToServer(
            userId,
            'IMAGE',
            'GEN_FAIL',
            `time=${executionTime.toFixed(3)}s e=${e}`
        )

        return -1
    }
}

export async function getWorkList(
    userId: string,
    workId: number,
    status: string
) {
    try {
        const response = await fetch(BACK_END_URL + '/image-list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                workId,
                status,
            }),
        })

        if (response.ok) {
            const data = await response.json()
            return data.workList
        } else {
            console.error(
                `Failed to get getWorkList with status: ${response.status}`
            )
            return []
        }
    } catch (e) {
        console.error(`getWorkList e=${e}`)

        return []
    }
}

export async function deleteGeneratedImage(userId: string, workId: number) {
    try {
        if (isDebugLog) {
            console.log(`deleteGeneratedImage userId=${userId} id=${workId}`)
        }

        const response = await fetch(BACK_END_URL + '/work-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                workId,
            }),
        })

        if (response.ok) {
            return true
        } else {
            console.error(
                `Failed to get getWorkList with status: ${response.status}`
            )
            return false
        }
    } catch (e) {
        console.error(`getWorkList e=${e}`)

        return false
    }
}

function base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64) // base64 디코딩
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: contentType })
}

export async function downloadFile(url: string): Promise<Blob> {
    if (isDebugLog) {
        console.log(`downloadFile url=${url}`)
    }

    const startTime = performance.now()

    //일단 바로 받고
    try {
        //const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
        const proxyUrl = ''
        const response = await fetch(proxyUrl + url)
        const blob = await response.blob()
        return blob
    } catch (error) {
        console.log('downloadFile 1 error=', error)
    }

    //Cors같은 문제가 생기면 서버에서 받게.
    try {
        // 서버에 요청 보내기
        const response = await fetch(BACK_END_URL + '/image-get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url }),
        })

        if (!response.ok) {
            console.log(
                `downloadFile e= ${response.status}: ${response.statusText}`
            )
            return null
        }

        // Base64 방식인 경우
        const data = await response.json()

        // const contentType = response.headers.get('Content-Type') || 'application/octet-stream'
        // const arrayBuffer = await response.arrayBuffer()
        // const base64Data = Buffer.from(arrayBuffer).toString('base64')

        if (!data.success) {
            if (!response.ok) {
                console.log('downloadFile success false')
            }

            const executionTime = (performance.now() - startTime) / 1000
            if (isDebugLog) {
                console.log(
                    `⏲️ generateImage response.ok execution time: ${executionTime.toFixed(
                        3
                    )}s`
                )
            }

            await logToServer(
                '',
                'IMAGE',
                'DOWNLOAD_FAILED',
                `time=${executionTime.toFixed(3)}s`
            )
            return null
        }

        const executionTime = (performance.now() - startTime) / 1000
        if (isDebugLog) {
            console.log(
                `⏲️ generateImage response.ok execution time: ${executionTime.toFixed(
                    3
                )}s`
            )
        }

        await logToServer(
            '',
            'IMAGE',
            'DOWNLOAD_SUCCESS',
            `time=${executionTime.toFixed(3)}s`
        )

        const blob = base64ToBlob(data.data, data.contentType)
        return blob
    } catch (error) {
        console.error('downloadFile 2 error=', error)

        const executionTime = (performance.now() - startTime) / 1000
        if (isDebugLog) {
            console.log(
                `⏲️ generateImage response.ok execution time: ${executionTime.toFixed(
                    3
                )}s`
            )
        }

        await logToServer(
            '',
            'IMAGE',
            'DOWNLOAD_FAILED',
            `time=${executionTime.toFixed(3)}s e=${error}`
        )
    }

    return null
}

export async function logToServer(
    userId: string,
    event: string,
    tag: string,
    message: string
) {
    try {
        // 서버에 요청 보내기
        const response = await fetch(BACK_END_URL + '/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, event, tag, message }),
        })

        if (!response.ok) {
            console.error(
                `logToServer e= ${response.status}: ${response.statusText}`
            )
        }
    } catch (error) {
        console.error('logToServer error=', error)
    }
}
