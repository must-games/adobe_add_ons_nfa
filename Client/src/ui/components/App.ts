// To support: theme="express" scale="medium" color="light"
// import these spectrum web components modules:
import '@spectrum-web-components/theme/express/scale-medium.js'
import '@spectrum-web-components/theme/express/theme-light.js'
import '@spectrum-web-components/theme/scale-medium.js'
import '@spectrum-web-components/theme/theme-light.js'

// To learn more about using "spectrum web components" visit:
// https://opensource.adobe.com/spectrum-web-components/
import '@spectrum-web-components/button/sp-button.js'
import '@spectrum-web-components/theme/sp-theme.js'

import '@spectrum-web-components/dropzone/sp-dropzone.js'
import '@spectrum-web-components/dropzone/sp-dropzone.js'

import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { DocumentSandboxApi } from '../../models/DocumentSandboxApi'
import { style } from './App.css'

import '@spectrum-web-components/button/sp-button.js'
import '@spectrum-web-components/button/sp-clear-button.js'
import '@spectrum-web-components/button/sp-close-button.js'

// Add this import for the picker component
import '@spectrum-web-components/picker/sp-picker.js'
import '@spectrum-web-components/menu/sp-menu-item.js'
import '@spectrum-web-components/menu/sp-menu-divider.js'
import '@spectrum-web-components/alert-banner/sp-alert-banner.js'
import '@spectrum-web-components/asset/sp-asset.js'
import '@spectrum-web-components/tooltip/sp-tooltip.js'
import '@spectrum-web-components/link/sp-link.js'

import {
    type AddOnSDKAPI,
    AppEvent,
    AppDragEndEventData,
    AppDragStartEventData,
    RuntimeType,
} from 'https://new.express.adobe.com/static/add-on-sdk/sdk.js'

import addOnUISdk from 'https://new.express.adobe.com/static/add-on-sdk/sdk.js'

import categoryData from '../../assets/category.json' // JSON 파일 가져오기

import { isDebugLog } from '../lib/config'
import { saveAs } from 'file-saver'
import {
    generateImage,
    getWorkList,
    deleteGeneratedImage,
    userAccess,
    downloadFile,
    getUser,
    createGenerateImage,
} from '../lib/router'
import './loading-screen'
import './AlertBanner'
// import uploadIcon from '../../assets/images/upload_icon.svg' // SVG 파일 import

@customElement('add-on-app')
export class App extends LitElement {
    @property({ type: Object })
    addOnUISdk!: AddOnSDKAPI

    @state()
    private _sandboxProxy!: DocumentSandboxApi

    @state()
    private _generatedImages: { url: string; id: number }[] = []

    @state()
    private _showAllImages = false

    @state()
    private _uploadedFile: File | null = null

    @state()
    private _selectedImage: string | null = null

    @state()
    private _selectedImageKey: string | null = null

    @state()
    private _selectedTheme = 'female'

    @state()
    private _imageCategories = this.initializeImageCategories(categoryData) // 수정된 부분

    @state()
    private alertVisible: boolean = false // 경고창 표시 여부를 제어하는 상태 변수

    @state()
    private alertMessage: string = '' // 경고창 메시지

    @state()
    private userAccessData: any = null

    // 카테고리 데이터를 초기화하는 메서드
    private initializeImageCategories(data: any) {
        const categories = {}
        data.category_list.forEach((category: string) => {
            categories[category] = data[category] || [] // 각 카테고리의 이미지를 가져옴
        })
        return categories
    }

    @state()
    private _hairColors = [
        { key: '1', fileName: 'color1.png', name: 'Color 1' },
        { key: '2', fileName: 'color2.png', name: 'Color 2' },
        { key: '3', fileName: 'color3.png', name: 'Color 3' },
        { key: '4', fileName: 'color4.png', name: 'Color 4' },
        { key: '5', fileName: 'color5.png', name: 'Color 5' },
        { key: '6', fileName: 'color6.png', name: 'Color 6' },
        { key: '7', fileName: 'color7.png', name: 'Color 7' },
        { key: '8', fileName: 'color8.png', name: 'Color 8' },
        { key: '9', fileName: 'color9.png', name: 'Color 9' },
        { key: '10', fileName: 'color10.png', name: 'Color 10' },
        { key: '11', fileName: 'color11.png', name: 'Color 11' },

        // Add more colors here as needed
    ]

    @state()
    private _openMenuForImage: string | null = null

    @state()
    private _previewModalOpen = false

    @state()
    private _previewImageSrc: string | null = null

    @state()
    private _previewText =
        'showcasing a sleek and sophisticated braided crown, enjoying a cultural food festival'

    @state()
    private _userId = ''

    @state()
    private _isLoading = false

    @state()
    private _loadingProgress = 10 // Default progress value

    @state()
    private _selectedHairColor: string | null = null

    @state() private _workId = -1

    @state() private _generateImageMessage = ''
    @state() private _generateDisabledTooltip = ''
    @state() private _loadingTitle = ''

    @state() private _isCheckWorkStatus = false

    private _selectedImageSupportsColor = false

    private _handleHairColorSelect(colorKey: string) {
        // 이미 선택된 색상과 같으면 해제, 아니면 새 colorKey로 설정
        if (this._selectedHairColor === colorKey) {
            this._selectedHairColor = null
        } else {
            this._selectedHairColor = colorKey
        }

        // 필요한 추가 작업
        // console.log(`Selected hair color: ${this._selectedHairColor}`)

        this.requestUpdate()
    }

    static get styles() {
        return style
    }

    // makeDraggableUsingUrl(elementId: string, previewUrl: string) {
    //     const image = document.getElementById(elementId)

    //     const dragCallbacks = {
    //         previewCallback: (image: HTMLElement) => {
    //             // Return a new URL for the remote preview
    //             return new URL(previewUrl)
    //         },
    //         completionCallback: async (image: HTMLElement) => {
    //             // Fetch and return the image blob
    //             const imageBlob = await fetch(image.src).then((response) =>
    //                 response.blob()
    //             )
    //             return [{ blob: imageBlob }]
    //         },
    //     }

    //     try {
    //         addOnUISdk.app.enableDragToDocument(image, dragCallbacks)
    //     } catch (error) {
    //         console.log('Failed to enable DragToDocument:', error)
    //     }
    // }

    async firstUpdated(): Promise<void> {
        if (isDebugLog) {
            console.log(`firststUpdated`)
        }

        // 전역 클릭 이벤트 리스너 추가
        document.addEventListener('click', this._handleGlobalClick.bind(this))

        this._userId = await addOnUISdk.app.currentUser.userId()
        await this._updateUserAccessData()

        if (isDebugLog) {
            console.log(`userId=${this._userId}`)
        }

        // 초기 이미지 목록 가져오기
        const workList = await getWorkList(this._userId, -1, 'COMPLETED')
        if (isDebugLog) {
            console.log(`workList=${JSON.stringify(workList)}`)
        }

        // 완료된 작업에서 이미지 URL 추출
        const completedImages = []
        for (const work of workList) {
            if (
                work.status === 'COMPLETED' &&
                work.result &&
                work.result.length > 0
            ) {
                for (const res of work.result) {
                    if (res.download_url) {
                        completedImages.push({
                            url: res.download_url,
                            id: work.id,
                        })
                    }
                }
            }
        }

        // 서버에서 가져온 이미지가 있으면 사용, 없으면 기본 이미지 사용
        if (completedImages.length > 0) {
            this._generatedImages = completedImages
            console.log(
                `this._generatedImages=${JSON.stringify(this._generatedImages)}`
            )
            console.log(
                `this.completedImages=${JSON.stringify(completedImages)}`
            )
        } else {
            // 기본 이미지 목록 사용
            this._generatedImages = []
        }

        // Get the UI runtime.
        const { runtime } = this.addOnUISdk.instance

        // Get the proxy object, which is required
        // to call the APIs defined in the Document Sandbox runtime
        this._sandboxProxy = await runtime.apiProxy(RuntimeType.documentSandbox)

        //addOnUISdk.app.enableDragToDocument

        addOnUISdk.app.on(
            AppEvent.dragstart,
            (eventData: AppDragStartEventData) => {
                console.log('The drag event has started for', eventData.element)
            }
        )

        addOnUISdk.app.on(
            AppEvent.dragend,
            (eventData: AppDragEndEventData) => {
                if (!eventData.dropCancelled) {
                    if (isDebugLog) {
                        console.log(
                            'The drag event has ended for',
                            eventData.element.id
                        )
                    }
                } else {
                    if (isDebugLog) {
                        console.log(
                            `The drag event was cancelled for ${eventData.element.id} ${eventData.dropCancelReason}`
                        )
                    }
                }
            }
        )
    }

    // 컴포넌트가 제거될 때 이벤트 리스너 정리
    disconnectedCallback() {
        super.disconnectedCallback()
        document.removeEventListener(
            'click',
            this._handleGlobalClick.bind(this)
        )
    }

    // 전역 클릭 이벤트 핸들러 추가
    private _handleGlobalClick(e: MouseEvent) {
        const target = e.target as HTMLElement
        const menuButton = this.shadowRoot?.querySelector('.image-actions')
        const menu = this.shadowRoot?.querySelector('.image-menu')

        if (menuButton && menu) {
            const isClickInsideMenu = menu.contains(target)
            const isClickOnMenuButton = menuButton.contains(target)

            if (!isClickInsideMenu && !isClickOnMenuButton) {
                this._openMenuForImage = null
                this.requestUpdate()
            }
        }
    }

    async updated(): Promise<void> {
        if (isDebugLog) {
            console.log(`updated`)
        }
    }

    private _handleImageDrag(event) {
        //https://developer.adobe.com/express/add-ons/docs/guides/develop/how_to/drag_and_drop/
        if (isDebugLog) {
            console.log(`handleImageDrag ${event.currentTarget.id}`)
        }

        const target = event.currentTarget as HTMLImageElement
        const imageUrl = target.src

        if (isDebugLog) {
            console.log(`handleImageDrag imageUrl=${imageUrl}`)
        }

        try {
            addOnUISdk.app.enableDragToDocument(event.currentTarget, {
                previewCallback: (element: HTMLElement) => {
                    if (isDebugLog) {
                        console.log(
                            `handleImageDrag previewCallback ${imageUrl}`
                        )
                    }

                    //const imageBlob = await downloadFile(imageUrl)
                    return new URL(imageUrl)
                    //return new URL(URL.createObjectURL(imageBlob))
                },
                completionCallback: async (element: HTMLElement) => {
                    if (isDebugLog) {
                        console.log(
                            `handleImageDrag completionCallback 1 ${imageUrl}`
                        )
                    }

                    // return the blob for the image
                    const imageBlob = await downloadFile(imageUrl)

                    if (isDebugLog) {
                        console.log(
                            `handleImageDrag completionCallback 2 imageBlob=${imageBlob} ${imageUrl}`
                        )
                    }

                    // 'image/jpeg로 지정되어 있다. 이게 안되면 drag & drop안됨.
                    // const fixedBlob = new Blob([imageBlob], {
                    //     type: 'image/jpeg',
                    // })

                    // if (isDebugLog) {
                    //     console.log(
                    //         `handleImageDrag completionCallback 3 ${imageUrl}`
                    //     )
                    // }

                    return [{ blob: imageBlob }]
                },
            })
        } catch (e) {
            console.error(`_handleImageDrag e=${e}`)
        }
    }

    private async _handleDoubleClick(event) {
        const target = event.currentTarget as HTMLImageElement
        const imageUrl = target.src

        await this._addImageFromURL(imageUrl)
    }

    private async _handleClick() {
        if (!this._uploadedFile) {
            this._showAlertBanner(
                'Please upload a profile photo to proceed with image generation'
            )
            return
        } else if (!this._selectedImage) {
            this._showAlertBanner(
                'Please select an image to proceed with image generation'
            )
            return
        }

        if (this._selectedImageSupportsColor) {
            if (this._selectedHairColor === null) {
                this._showAlertBanner('Please select a hair color')
                return
            }
        }

        try {
            // console.log(`_selectedImage=${this._selectedImage}`)
            // console.log(`_selectedImageKey=${this._selectedImageKey}`)
            // console.log(`_uploadedFile=${this._uploadedFile.name}`)
            this._isLoading = true
            this._loadingProgress = 0
            this._workId = -1
            // Simulate progress
            const progressInterval = setInterval(() => {
                if (this._loadingProgress < 90) {
                    this._loadingProgress += 5
                    this.requestUpdate()
                } else {
                    clearInterval(progressInterval)
                }
            }, 800)

            let workId = await createGenerateImage(this._userId)
            this._workId = workId

            if (isDebugLog) {
                console.log('◀ createGenerateImage returned:', workId)
            }

            if (workId < 0) {
                clearInterval(progressInterval)
                this._showAlertBanner('Failed to generate image')
                // console.error(`generateImage failed with workId: ${workId}`)
                this._isLoading = false
                this.requestUpdate()
                return
            }

            this._workId = await generateImage(
                this._userId,
                this._workId,
                this._selectedImageKey,
                this._uploadedFile,
                this._selectedHairColor || ''
            )

            console.log(`Generated workId: ${this._workId}`)

            if (this._workId < 0) {
                this._showAlertBanner('Failed to generate image')
                // console.error(`generateImage failed with workId: ${workId}`)
                this._isLoading = false
                this.requestUpdate()
                return
            }

            // 작업 상태 확인 및 이미지 업데이트를 위한 함수
            const checkWorkStatus = async () => {
                if (isDebugLog) {
                    console.log(`checkWorkStatus start. workId :`, workId)
                }
                if (this._isCheckWorkStatus) {
                    if (isDebugLog) {
                        console.log(
                            `checkWorkStatus start. true workId :`,
                            workId
                        )
                    }
                    return false
                }
                this._isCheckWorkStatus = true
                const workList = await getWorkList(this._userId, workId, '')
                if (isDebugLog) {
                    console.log(
                        `checkWorkStatus start=${JSON.stringify(workList)}`
                    ) //무한
                }
                //workList=[{"id":26,"createdAt":"2025-03-24T03:06:40.665Z","updatedAt":"2025-03-24T03:06:36.988Z","result":[{"filename":"image-result/dev_abodeaddon-ai_adobe_00025.jpg","download_url":"https://objectstorage.kr-central-2.kakaocloud.com/v1/cccf2acbb0a74ae88e2d77e696b7be52/abodeaddon-ai-dev/image-result/dev_abodeaddon-ai_adobe_00025.jpg"}],"status":"COMPLETED"},{"id":25,"createdAt":"2025-03-24T03:05:34.938Z","updatedAt":"2025-03-24T03:05:35.912Z","result":[{"filename":"image-result/dev_abodeaddon-ai_adobe_00024.jpg","download_url":"https://objectstorage.kr-central-2.kakaocloud.com/v1/cccf2acbb0a74ae88e2d77e696b7be52/abodeaddon-ai-dev/image-result/dev_abodeaddon-ai_adobe_00024.jpg"}],
                if (workList[0].status === 'CANCELED') {
                    this._isCheckWorkStatus = false
                    this._workId = -1
                    console.log('The image generation has been canceled.')
                    return true
                } else if (workList[0].status === 'ERROR') {
                    this._showAlertBanner(
                        'An error occurred while generating the image. Please try again later.'
                    )
                    this._isCheckWorkStatus = false
                    this._workId = -1
                    return true
                }

                // 완료된 작업에서 이미지 URL 추출
                const completedImages = []
                let isCompleted = false

                for (let i = 0; i < workList.length; i++) {
                    const work = workList[i]
                    // console.log(`Processing work ${i}:`, work)
                    // console.log(`Work status: ${work.status}`)
                    if (isDebugLog) {
                        console.log(
                            `완료된 작업에서 이미지 URL 추출시작. work.id=${work.id}`
                        ) //ok
                    }
                    if (work.status === 'COMPLETED') {
                        setTimeout(async () => {
                            if (work.result && work.result.length > 0) {
                                if (isDebugLog) {
                                    console.log(
                                        `Workid has ${work.result.length} results`
                                    ) //ok
                                }

                                for (let j = 0; j < work.result.length; j++) {
                                    const res = work.result[j]
                                    // console.log(`Processing result ${j}:`, res)
                                    console.log(
                                        `Processing result + id ${j}:`,
                                        work.id
                                    ) //undefined
                                    //{filename: 'image-result/dev_abodeaddon-ai_adobe_00026.jpg', download_url: 'https://objectstorage.kr-central-2.kakaocloud.com/…ev/image-result/dev_abodeaddon-ai_adobe_00026.jpg'}

                                    if (res.download_url) {
                                        if (isDebugLog) {
                                            console.log(
                                                `Adding URL to completedImages: ${res.download_url}`
                                            )
                                        }
                                        this._generatedImages = [
                                            {
                                                url: res.download_url,
                                                id: workId,
                                            },
                                            ...this._generatedImages,
                                        ]

                                        await this._addImageFromURL(
                                            res.download_url
                                        )
                                        isCompleted = true
                                        console.log(`Work ${i} is COMPLETED`)
                                        this._isLoading = false
                                        this._loadingProgress = 100
                                        this.requestUpdate()
                                    }
                                }
                            }
                            this._workId = -1
                            this._isCheckWorkStatus = false
                        }, 0)
                        return true
                    } else if (work.status === 'ERROR') {
                        this._showAlertBanner(
                            ' An error occurred while generating the image. Please try again in a moment.'
                        )
                        this._isCheckWorkStatus = false
                    }
                }

                // console.log(
                //     `Extracted ${completedImages.length} completed images:`,
                //     completedImages
                // )

                // 완료된 이미지가 있을 때만 this._generatedImages에 추가
                // if (completedImages.length > 0) {
                //     // 기존 이미지 목록에 새 이미지 추가 (중복 방지)
                //     let updatedImages = [...this._generatedImages]

                //     for (const newImage of completedImages) {
                //         if (
                //             !updatedImages.some(
                //                 (image) => image.url === newImage.url
                //             )
                //         ) {
                //             updatedImages.unshift(newImage) // 배열의 맨 앞에 추가
                //         }
                //     }

                //     // 새 배열 참조로 할당하여 변경 감지 트리거
                //     this._generatedImages = updatedImages
                //     console.log(
                //         `Updated this._generatedImages:`,
                //         this._generatedImages
                //     ) //['https://objectstorage.kr-central-2.kakaocloud.com/…ev/image-result/dev_abodeaddon-ai_adobe_00036.jpg',....

                //     // await this._updateUserAccessData()
                //     this.requestUpdate()
                //     return true // 작업 완료
                // } else if (isCompleted) {
                //     this._showAlertBanner(
                //         'Work is completed but no images found'
                //     )
                //     return true // 작업은 완료되었지만 이미지가 없음
                // }
                this._isCheckWorkStatus = false
                return false // 작업 진행 중
            }

            // 작업 상태 확인 (최초 1회)
            const isComplete = await checkWorkStatus()

            // 작업이 완료되지 않았다면 주기적으로 상태 확인
            if (!isComplete) {
                // const workStatus = await checkWorkStatus(); // Assuming checkWorkStatus returns work status

                if (isDebugLog) {
                    console.log(
                        `Work is not completed yet. Setting up polling...`
                    )
                }

                // 5초마다 작업 상태 확인 (최대 12회, 총 1분)
                let attempts = 0
                const interval = setInterval(async () => {
                    attempts++
                    if (isDebugLog) {
                        console.log(`Polling attempt ${attempts}`) //무한
                    }

                    const isComplete = await checkWorkStatus()

                    if (isComplete) {
                        console.log(
                            `Polling complete. isComplete=${isComplete}, attempts=${attempts}`
                        )
                        clearInterval(interval)

                        // Hide loading screen after operation completes
                        this._isLoading = false
                        if (isDebugLog) {
                            console.log(
                                '⏹ setting _isLoading=false, now re-rendering…'
                            )
                        }

                        await this._updateUserAccessData()
                        this.requestUpdate()
                        if (isDebugLog) {
                            console.log(
                                '🔄 requestUpdate() after loading complete'
                            )
                        }
                    }
                }, 1000)
            }
        } catch (error) {
            console.error('_handleClick error:', error)
        }
    }

    // 경고창을 표시하는 메서드
    private _showAlertBanner(message: string) {
        this.alertVisible = true // 경고창 표시
        this.alertMessage = message // 메시지 저장

        // 5초 후에 경고창을 숨김
        setTimeout(() => {
            const alertBanner = this.shadowRoot?.querySelector('.alert-banner')
            if (alertBanner) {
                alertBanner.classList.add('fade-out') // fade-out 클래스 추가
                setTimeout(() => {
                    this.alertVisible = false // 경고창 숨김
                }, 500) // fadeOut 애니메이션 시간과 일치
            } else {
                this.alertVisible = false // 경고창 숨김
            }
        }, 5000) // 5초 후에 fade-out 시작
    }

    private async _addImageFromURL(url: string) {
        if (isDebugLog) {
            console.log(`_addImageFromURL url=${url}`)
        }

        try {
            const blob = await downloadFile(url)

            // MIME 타입이 binary/octet-stream인 경우에도 이미지로 처리
            if (
                blob.type.startsWith('image/') ||
                blob.type === 'binary/octet-stream' ||
                blob.type === 'application/octet-stream'
            ) {
                // 파일 확장자로 이미지 타입 확인
                const fileExtension = url.split('.').pop()?.toLowerCase()
                const validImageExtensions = [
                    'jpg',
                    'jpeg',
                    'png',
                    'gif',
                    'webp',
                ]

                if (validImageExtensions.includes(fileExtension)) {
                    // 필요한 경우 새로운 Blob 생성하여 올바른 MIME 타입 설정
                    const newBlob = new Blob([blob], {
                        type: `image/${
                            fileExtension === 'jpg' ? 'jpeg' : fileExtension
                        }`,
                    })
                    await addOnUISdk.app.document.addImage(newBlob)
                } else {
                    throw new Error('지원하지 않는 이미지 형식입니다.')
                }
            } else {
                throw new Error(`지원하지 않는 MIME 타입입니다: ${blob.type}`)
            }
        } catch (error) {
            console.error('이미지 추가 실패:', error)
        }
    }

    // private async _addImageFromBlob(blob: Blob) {
    //     try {
    //         await addOnUISdk.app.document.addImage(blob)
    //     } catch (error) {
    //         console.log('Failed to add the image to the page. ' + error)
    //     }
    // }

    private _handleFileUpload(event: CustomEvent) {
        const files = event.detail.files
        if (files && files.length > 0) {
            this._uploadedFile = files[0]
            this.requestUpdate()
        }
    }

    //사진 업로드 했을때
    private _openFileDialog() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.addEventListener('change', async (event: Event) => {
            const target = event.target as HTMLInputElement
            if (target.files && target.files.length > 0) {
                this._uploadedFile = target.files[0]

                const url = URL.createObjectURL(this._uploadedFile)
                // if (isDebugLog) {
                //     console.log('_openFileDialog URL:', url) //_openFileDialog URL: blob:https://localhost:5241/d4d9ee20-9b42-475c-8a09-3b000fa5be7e
                // }

                // await this._addImageFromURL(url)//화면에 이미지 붙여넣기

                this.requestUpdate()
            }
        })
        input.click()
    }

    private _deletePhoto() {
        this._uploadedFile = null
        this.requestUpdate()
    }

    private _handleImageSelect(
        image: string,
        imageKey: string,
        color: boolean
    ) {
        if (this._selectedImage === image) {
            this._selectedImage = null
            this._selectedImageKey = null
        } else {
            this._selectedImage = image
            this._selectedImageKey = imageKey
        }

        // const selectedCategory = this._selectedCategory
        // if (selectedCategory && this._categoryData[selectedCategory]) {
        //     const selectedImageData = this._categoryData[selectedCategory].find(
        //         (img) => img.path === image
        //     )
        if (color === true) {
            this._selectedImageSupportsColor = true
        } else {
            this._selectedImageSupportsColor = false
        }

        if (isDebugLog) {
            console.log(
                `_handleImageSelect.Selected Image: ${this._selectedImage}, Selected Image Key: ${this._selectedImageKey}`
            )
        }

        this.requestUpdate()
    }

    // private _handleThemeSelect(e: CustomEvent) {
    //     const target = e.target as HTMLSelectElement
    //     this._selectedTheme = target.value
    //     this.requestUpdate()
    // }

    private _toggleShowAllImages() {
        this._openMenuForImage = null
        this._showAllImages = !this._showAllImages
        this.requestUpdate()
    }

    private _toggleImageMenu(img: string, e: MouseEvent) {
        e.stopPropagation()
        this._openMenuForImage = this._openMenuForImage === img ? null : img
        this.requestUpdate()
    }

    private async _handleMenuAction(
        action: string,
        img: string,
        id: number | null
    ) {
        this._openMenuForImage = null
        switch (action) {
            case 'download':
                console.log('Download image:', img)
                this._downloadImage(img)
                break
            case 'preview':
                console.log('Open preview for:', img)
                this._openPreviewModal(img)
                break
            case 'delete':
                console.log('Delete image:', img)
                // 클릭한 이미지의 id를 찾습니다
                const imageToDelete = this._generatedImages.find(
                    (image) => image.url === img
                )
                if (imageToDelete) {
                    const isDeleted = await deleteGeneratedImage(
                        this._userId,
                        imageToDelete.id
                    )
                    if (isDeleted) {
                        this._generatedImages = this._generatedImages.filter(
                            (i) => i.url !== img
                        )
                    }
                }
                break
        }
        this.requestUpdate()
    }
    private _getWorkId() {
        throw new Error('Method not implemented.')
    }

    private async _downloadImage(img: string) {
        if (isDebugLog) {
            console.log(`_downloadImage url=${img}`)
        }

        try {
            if (isDebugLog) {
                console.log('다운로드 시작:', img)
            }

            // 파일 이름 추출 (URL에서 마지막 부분)
            const fileName = img.split('/').pop() || 'downloaded_image.jpg'

            if (isDebugLog) {
                console.log('파일 이름:', fileName)
            }

            const blob = await downloadFile(img)

            // 파일 확장자 확인 및 MIME 타입 설정
            const fileExtension = fileName.split('.').pop()?.toLowerCase()
            const mimeType =
                fileExtension === 'jpg'
                    ? 'image/jpeg'
                    : `image/${fileExtension}`

            // 새로운 Blob 생성하여 올바른 MIME 타입 설정
            const newBlob = new Blob([blob], { type: mimeType })

            // FileSaver를 사용하여 파일 저장
            saveAs(newBlob, fileName)
            console.log('파일 저장 완료')
        } catch (error) {
            console.error('이미지 다운로드 중 오류 발생:', error)
            this._showAlertBanner(
                '이미지 다운로드에 실패했습니다. CORS 정책을 확인해주세요.'
            )
        }
    }

    private _openPreviewModal(img: string) {
        this._previewImageSrc = img
        this._previewModalOpen = true
    }

    private _closePreviewModal() {
        this._previewModalOpen = false
        this._previewImageSrc = null
    }

    private async _clearHistory() {
        try {
            // 모든 이미지의 삭제 요청을 Promise 배열로 생성
            const deletePromises = this._generatedImages.map((image) =>
                deleteGeneratedImage(this._userId, image.id)
            )

            // 모든 삭제 요청을 동시에 실행하고 결과를 기다림
            const results = await Promise.all(deletePromises)

            // 모든 삭제가 성공적으로 완료되었는지 확인
            const allDeleted = results.every((result) => result === true)

            if (allDeleted) {
                // 모든 이미지가 성공적으로 삭제되면 배열을 비움
                this._generatedImages = []
            } else {
                console.error('일부 이미지 삭제 실패')
            }
        } catch (error) {
            console.error('이미지 삭제 중 오류 발생:', error)
        }
    }

    // 사용자 접근 데이터 업데이트 함수 추가
    private async _updateUserAccessData() {
        if (isDebugLog) {
            console.log(`_updateUserAccessData`)
        }
        const userAccessData = await userAccess(this._userId)

        this.userAccessData = userAccessData
        this.userAccessData.limitInfo.REMAINING_DAILY_IMAGE_GENERATION_LIMIT =
            this.userAccessData.limitInfo.DAILY_IMAGE_GENERATION_LIMIT -
            this.userAccessData.user.imagesGeneratedToday

        this.userAccessData.user = await getUser(this._userId)
        this.userAccessData.user.imagesGeneratedToday =
            this.userAccessData.user.imagesGeneratedToday

        if (isDebugLog) {
            // console.log(`------------------`)
            // console.log(`userAccessData=${JSON.stringify(userAccessData)}`)
            console.log(
                `user imagesGeneratedToday = ${userAccessData.user.imagesGeneratedToday}`
            )
            console.log(
                `DAILY_IMAGE_GENERATION_LIMIT = ${userAccessData.limitInfo.DAILY_IMAGE_GENERATION_LIMIT}`
            )
            // console.log(
            //     `STORED_IMAGE_EXPIRATION_DAYS = ${userAccessData.limitInfo.REMAINING_DAILY_IMAGE_GENERATION_LIMIT}`
            // )
            console.log(`userAccessData=${JSON.stringify(userAccessData)}`)
            // console.log(`userAccessData=${JSON.stringify(userAccessData)}`)
            // console.log(`------------------`)
        }
    }

    // 생성 취소 핸들러
    private _handleGenerationCancelled(
        e: CustomEvent<{ nextCancelWork: boolean }>
    ) {
        this._isLoading = false
        this.requestUpdate()
    }

    // 생성 실패 핸들러
    private _handleGenerationFailed(e: CustomEvent) {
        const errorMessage = e.detail.message
        this._isLoading = false

        // 에러 메시지가 있으면 alert 배너 표시
        if (errorMessage) {
            this._showAlertBanner(errorMessage)
        }

        this.requestUpdate()
    }

    render() {
        const isButtonDisabled = false
        // (this.userAccessData?.limitInfo
        //     .REMAINING_DAILY_IMAGE_GENERATION_LIMIT ?? 0) < 1

        return html`
            <sp-theme theme="express" color="light" scale="medium">
                ${this.alertVisible
                    ? html` <alert-banner .visible="${this.alertVisible}"
                      .message="${this.alertMessage}"/ >`
                    : null}
                ${this._isLoading
                    ? html`<loading-screen
                          progress="${this._loadingProgress}"
                          workId="${this._workId}"
                          userId="${this._userId}"
                          title="${this._loadingTitle}"
                          @generation-cancelled="${this
                              ._handleGenerationCancelled}"
                          @generation-failed="${this._handleGenerationFailed}"
                      ></loading-screen>`
                    : html`
                          <div class="container">
                              ${this._showAllImages
                                  ? html`
                                        <!-- "See all" 모드 -->
                                        <div class="full-gallery-header">
                                            <div
                                                class="back-button"
                                                @click=${this
                                                    ._toggleShowAllImages}
                                            >
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M15 18L9 12L15 6"
                                                        stroke="currentColor"
                                                        stroke-width="2"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                            <h2 class="section-title">
                                                Generated images
                                                (${this._generatedImages
                                                    .length})
                                            </h2>
                                        </div>

                                        <div class="full-gallery-content">
                                            ${this._generatedImages.map(
                                                (img, id) => {
                                                    if (isDebugLog) {
                                                        console.log(
                                                            `rendering image-${id}`
                                                        )
                                                    }
                                                    return html`
                                                        <div
                                                            class="full-gallery-item"
                                                            style="padding-top:0;"
                                                        >
                                                            <img
                                                                id="image-all-${id}"
                                                                src="${img.url}"
                                                                alt="Generated image"
                                                                @load=${this
                                                                    ._handleImageDrag}
                                                                @dblclick=${(
                                                                    e: MouseEvent
                                                                ) =>
                                                                    this._handleDoubleClick(
                                                                        e
                                                                    )}
                                                            />
                                                            <div
                                                                class="image-actions"
                                                                style="width: 24px; height: 24px; border-radius: 10%; background-color: lightgray;"
                                                            >
                                                                <sp-button-group>
                                                                    <sp-action-button
                                                                        quiet
                                                                        @click=${(
                                                                            e: MouseEvent
                                                                        ) =>
                                                                            this._toggleImageMenu(
                                                                                img.url,
                                                                                e
                                                                            )}
                                                                        style="padding-left:2px; padding-top:3px; display:block;"
                                                                    >
                                                                        <svg
                                                                            slot="icon"
                                                                            width="18"
                                                                            height="18"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                        >
                                                                            <circle
                                                                                cx="12"
                                                                                cy="12"
                                                                                r="2"
                                                                                fill="currentColor"
                                                                            ></circle>
                                                                            <circle
                                                                                cx="19"
                                                                                cy="12"
                                                                                r="2"
                                                                                fill="currentColor"
                                                                            ></circle>
                                                                            <circle
                                                                                cx="5"
                                                                                cy="12"
                                                                                r="2"
                                                                                fill="currentColor"
                                                                            ></circle>
                                                                        </svg>
                                                                    </sp-action-button>
                                                                </sp-button-group>

                                                                ${this
                                                                    ._openMenuForImage ===
                                                                img.url
                                                                    ? html`
                                                                          <div
                                                                              class="image-menu"
                                                                              style="
                                                                                position: absolute;
                                                                                top: 100%;
                                                                                right: 0;
                                                                                background-color: #fff;
                                                                                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                                                                                border-radius: 8px;
                                                                                padding: 3px;
                                                                                z-index: 10;
                                                                                font-size: 14px;
                                                                                width: 90px;
                                                                                margin-top:5px;
                                                                                "
                                                                          >
                                                                              <div
                                                                                  class="menu-item"
                                                                                  @click=${() =>
                                                                                      this._handleMenuAction(
                                                                                          'download',
                                                                                          img.url,
                                                                                          null
                                                                                      )}
                                                                              >
                                                                                  Download
                                                                              </div>
                                                                              <div
                                                                                  class="menu-item"
                                                                                  @click=${() =>
                                                                                      this._handleMenuAction(
                                                                                          'preview',
                                                                                          img.url,
                                                                                          null
                                                                                      )}
                                                                              >
                                                                                  Open
                                                                                  preview
                                                                              </div>
                                                                              <div
                                                                                  class="menu-item delete"
                                                                                  @click=${() =>
                                                                                      this._handleMenuAction(
                                                                                          'delete',
                                                                                          img.url,
                                                                                          id
                                                                                      )}
                                                                              >
                                                                                  Delete
                                                                              </div>
                                                                          </div>
                                                                      `
                                                                    : ''}
                                                            </div>
                                                        </div>
                                                    `
                                                }
                                            )}
                                        </div>
                                        <!-- 공통 preveiw 모달 렌더링 -->
                                        ${this._previewModalOpen &&
                                        this._previewImageSrc
                                            ? html`
                                                  <div
                                                      class="modal-overlay"
                                                      style="
                                                                            position: fixed;
                                                                            inset: 0;
                                                                            background-color: rgba(0,0,0,0.5);
                                                                            display: flex;
                                                                            align-items: center;
                                                                            justify-content: center;
                                                                            z-index: 1000;
                                                                        "
                                                      @click=${this
                                                          ._closePreviewModal}
                                                  >
                                                      <div
                                                          class="modal-content"
                                                          style="
                                                                                background-color: white;
                                                                                padding: 34px;
                                                                                border-radius: 16px;
                                                                                max-width: 400px;
                                                                                width: 90%;
                                                                                position: relative;
                                                                                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                                                                                margin:20px;
                                                                                "
                                                          @click=${(e: Event) =>
                                                              e.stopPropagation()}
                                                      >
                                                          <!-- 닫기 버튼 -->
                                                          <sp-action-button
                                                              quiet
                                                              style="
                                                                                position: absolute;
                                                                                top: 12px;
                                                                                right: 12px;
                                                                                cursor: pointer;
                                                                            "
                                                              @click=${this
                                                                  ._closePreviewModal}
                                                          >
                                                              ✕
                                                          </sp-action-button>

                                                          <!-- 이미지 -->
                                                          <img
                                                              src="${this
                                                                  ._previewImageSrc}"
                                                              alt="Preview"
                                                              style="width: 100%; border-radius: 8px;"
                                                          />

                                                          <!-- 설명 텍스트 -->
                                                          <!--  <div
                                                                    style="
                                                                        margin-top: 16px;
                                                                        padding: 12px;
                                                                        background-color: #222;
                                                                        color: white;
                                                                        text-align: center;
                                                                        border-radius: 8px;
                                                                        font-size: 14px;
                                                                        line-height: 1.4;
                                                                        "
                                                                >
                                                                    ${this
                                                              ._previewText}
                                                                </div> -->
                                                      </div>
                                                  </div>
                                              `
                                            : ''}
                                        ${this._generatedImages.length > 0
                                            ? html` <div class="drag-drop-hint">
                                                      Drag & drop or
                                                      double-click to add.
                                                      Images auto-delete after 7
                                                      days.
                                                  </div>
                                                  <div
                                                      class="clear-history-container"
                                                  >
                                                      <sp-button
                                                          variant="negative"
                                                          style="width: 100%;"
                                                          @click=${this
                                                              ._clearHistory}
                                                      >
                                                          Clear history
                                                      </sp-button>
                                                  </div>`
                                            : html` <div class="empty-state">
                                                  History is empty, generate an
                                                  image and it will show up here
                                              </div>`}
                                    `
                                  : html`
                                        <!-- 기존 화면 -->
                                        <div
                                            class="fixed-container"
                                            style="position:fixed; top:0; left:0; right:0;"
                                        >
                                            <!-- Header -->
                                            <sp-top-nav
                                                class="header"
                                                style="display:block;"
                                            >
                                                Explore more with KKUSA:
                                                <sp-link
                                                    href="https://kkusa.mustg.kr/en/"
                                                    static-color="white"
                                                    target="_blank"
                                                >
                                                    https://kkusa.mustg.kr/
                                                </sp-link>
                                            </sp-top-nav>

                                            <div class="full-content">
                                                <!-- Upload Profile Photo Section -->
                                                <div class="section">
                                                    <div
                                                        class="section-header flex-col items-start"
                                                    >
                                                        <h2
                                                            class="section-title"
                                                        >
                                                            Upload a profile photo
                                                        </h2>
                                                    </div>
                                                    ${
                                                        this._uploadedFile
                                                            ? html`
                                                                  <sp-dropzone
                                                                      class="dropzone"
                                                                      style="height: 80px;background-color: #f5f5f5; "
                                                                  >
                                                                      <div
                                                                          class="preview-container flex flex-row items-center justify-center h-full"
                                                                          style="gap: 16px;"
                                                                      >
                                                                          <img
                                                                              src="${URL.createObjectURL(
                                                                                  this
                                                                                      ._uploadedFile
                                                                              )}"
                                                                              class="image-preview rounded-lg object-fit"
                                                                              style="width: 60px; height: 60px;"
                                                                          />
                                                                          <div
                                                                              class="button-group flex flex-col"
                                                                              style="gap: 8px;"
                                                                          >
                                                                              <sp-button
                                                                                  size="s"
                                                                                  variant="secondary"
                                                                                  style="font-size: 12px;"
                                                                                  @click="${this
                                                                                      ._openFileDialog}"
                                                                                  >Change
                                                                                  Photo</sp-button
                                                                              >
                                                                              <sp-button
                                                                                  size="s"
                                                                                  variant="secondary"
                                                                                  style="font-size: 12px; color:red;"
                                                                                  @click="${this
                                                                                      ._deletePhoto}"
                                                                                  >Clear</sp-button
                                                                              >
                                                                          </div>
                                                                      </div>
                                                                  </sp-dropzone>
                                                              `
                                                            : html`
                                                                  <sp-dropzone
                                                                      class="dropzone"
                                                                      @sp-dropzone-drop="${this
                                                                          ._handleFileUpload}"
                                                                      @click="${this
                                                                          ._openFileDialog}"
                                                                      style="height: 80px;"
                                                                  >
                                                                      <div
                                                                          class="dropzone-content"
                                                                          style="background-color: #f5f5f5;padding:4px;"
                                                                      >
                                                                          <div
                                                                              class="upload-icon"
                                                                          >
                                                                              <img
                                                                                  src="./images/upload_icon.svg"
                                                                                  alt="Upload Icon"
                                                                                  width="27"
                                                                                  height="27"
                                                                              />
                                                                          </div>
                                                                          <div
                                                                              class="upload-text"
                                                                          >
                                                                              For
                                                                              best
                                                                              results,
                                                                              please
                                                                              upload
                                                                              a
                                                                              clear,
                                                                              full-face,
                                                                              front-view
                                                                              color
                                                                              photo
                                                                              without
                                                                              glasses.
                                                                          </div>
                                                                      </div>
                                                                  </sp-dropzone>
                                                              `
                                                    }
                                                </div>

                                                <!-- Select Hairstyle Section -->
                                                <div
                                                    class="section"
                                                    style="padding-bottom:0px; padding-top:0px;"

                                                >
                                                    <div
                                                        class="section-header"
                                                        style="margin-bottom: 0px;"
                                                    >
                                                        <h2
                                                            class="section-title"
                                                        >
                                                            Select Hairstyle
                                                        </h2>
                                                    </div>

                                                    <!-- Female / Male  -->
                                                    <div
                                                        style="
                                                        display: flex;
                                                        gap: 8px;
                                                         margin-top: 4px;
                                                        justify-content: center;
                                                        height: 33px;
                                                    "
                                                    >
                                                        <!-- Female 버튼 -->
                                                        <button
                                                            style="
                                                            width: 100%;
                                                            border: none;
                                                            outline: none;
                                                            border-radius: 8px;
                                                            cursor: pointer;
                                                            font-size: 12px;
                                                            font-weight: 600;
                                                            height:25px;
                                                            /* 선택 여부에 따라 색상 변경 */
                                                            background-color: ${
                                                                this
                                                                    ._selectedTheme ===
                                                                'female'
                                                                    ? '#2680eb'
                                                                    : '#f0f0f0'
                                                            };
                                                            color: ${
                                                                this
                                                                    ._selectedTheme ===
                                                                'female'
                                                                    ? '#ffffff'
                                                                    : '#333333'
                                                            };
                                                            transition: background-color 0.2s ease;
                                                        "
                                                            @click="${() => {
                                                                this._selectedTheme =
                                                                    'female'
                                                            }}"
                                                        >
                                                            Female
                                                        </button>

                                                        <!-- Male 버튼 -->
                                                        <button
                                                            style="
                                                            width: 100%;
                                                            border: none;
                                                            outline: none;
                                                            border-radius: 8px;
                                                            cursor: pointer;
                                                            font-size: 12px;
                                                            height:25px;
                                                            font-weight: 600;
                                                            background-color: ${
                                                                this
                                                                    ._selectedTheme ===
                                                                'male'
                                                                    ? '#2680eb'
                                                                    : '#f0f0f0'
                                                            };
                                                            color: ${
                                                                this
                                                                    ._selectedTheme ===
                                                                'male'
                                                                    ? '#ffffff'
                                                                    : '#333333'
                                                            };
                                                            transition: background-color 0.2s ease;
                                                        "
                                                            @click="${() => {
                                                                this._selectedTheme =
                                                                    'male'
                                                            }}"
                                                        >
                                                            Male
                                                        </button>
                                                    </div>

                                                    <!-- 스크롤 가능한 이미지 목록 -->
                                                    <div
                                                        class="scrollable-content"
                                                    >
                                                        <div
                                                            class="image-categories"
                                                        >
                                                            ${
                                                                // _imageCategories 객체를 순회하여,
                                                                // 현재 _selectedTheme('female','male')와 일치하는 카테고리만 필터링
                                                                Object.entries(
                                                                    this
                                                                        ._imageCategories
                                                                )
                                                                    .filter(
                                                                        ([
                                                                            category,
                                                                        ]) =>
                                                                            // 'all' 일 경우 전체 표시, 그렇지 않으면 _selectedTheme와 동일한 것만 표시
                                                                            this
                                                                                ._selectedTheme ===
                                                                                'all' ||
                                                                            this
                                                                                ._selectedTheme ===
                                                                                category
                                                                    )
                                                                    .map(
                                                                        ([
                                                                            category,
                                                                            images,
                                                                        ]) => html`
                                                                            <div
                                                                                class="category"
                                                                            >
                                                                                <div
                                                                                    class="image-grid"
                                                                                >
                                                                                    ${Array.isArray(
                                                                                        images
                                                                                    )
                                                                                        ? images.map(
                                                                                              (
                                                                                                  imageObj
                                                                                              ) => html`
                                                                                                  <div
                                                                                                      class="image-item ${this
                                                                                                          ._selectedImage ===
                                                                                                      imageObj.path
                                                                                                          ? 'selected'
                                                                                                          : ''}"
                                                                                                      @click=${() =>
                                                                                                          this._handleImageSelect(
                                                                                                              imageObj.path,
                                                                                                              imageObj.key,
                                                                                                              imageObj.color
                                                                                                          )}
                                                                                                      style="cursor: pointer;"
                                                                                                  >
                                                                                                      <img
                                                                                                          src="${`./images/${imageObj.path}`}"
                                                                                                          alt="Image"
                                                                                                          style="width: 100%; height: auto; object-fit: cover;"
                                                                                                      />

                                                                                                      <!-- color가 true이면 팔레트 아이콘 + 툴팁 표시 -->
                                                                                                      ${imageObj.color
                                                                                                          ? html`
                                                                                                                <div
                                                                                                                    style="
                                                                                                                        position: absolute;
                                                                                                                        bottom: 8px;
                                                                                                                        left: 8px;
                                                                                                                    "
                                                                                                                >
                                                                                                                    <!-- 마우스 오버 시 툴팁 노출 -->
                                                                                                                    <div
                                                                                                                        style="
                                                                                                                            position: relative;
                                                                                                                            display: inline-block;
                                                                                                                            cursor: pointer;
                                                                                                                        "
                                                                                                                        @mouseover="${(
                                                                                                                            e: MouseEvent
                                                                                                                        ) => {
                                                                                                                            const tooltip =
                                                                                                                                (
                                                                                                                                    e.currentTarget as HTMLElement
                                                                                                                                ).querySelector(
                                                                                                                                    '.palette-tooltip'
                                                                                                                                ) as HTMLElement
                                                                                                                            if (
                                                                                                                                tooltip
                                                                                                                            )
                                                                                                                                tooltip.style.display =
                                                                                                                                    'block'
                                                                                                                        }}"
                                                                                                                        @mouseout="${(
                                                                                                                            e: MouseEvent
                                                                                                                        ) => {
                                                                                                                            const tooltip =
                                                                                                                                (
                                                                                                                                    e.currentTarget as HTMLElement
                                                                                                                                ).querySelector(
                                                                                                                                    '.palette-tooltip'
                                                                                                                                ) as HTMLElement
                                                                                                                            if (
                                                                                                                                tooltip
                                                                                                                            )
                                                                                                                                tooltip.style.display =
                                                                                                                                    'none'
                                                                                                                        }}"
                                                                                                                    >
                                                                                                                        <!-- Using external SVG file instead of inline code -->
                                                                                                                        <img 
                                                                                                                        style="width: 24px; height: 24px; position:absolute; bottom: -8px; left: -5px;"
                                                                                                                            src="./images/palette.png" 
                                                                                                                            alt="Hair coloring available"
                                                                                                                        />

                                                                                                                        <!-- 말풍선(툴팁) -->
                                                                                                                        <div
                                                                                                                            class="palette-tooltip"
                                                                                                                            style="
                                                                                                                                display: none;
                                                                                                                                position: absolute;
                                                                                                                                bottom: 18px;
                                                                                                                                left: -5px;
                                                                                                                                background: rgba(0, 0, 0, 0.8);
                                                                                                                                color: #fff;
                                                                                                                                padding: 4px 8px;
                                                                                                                                border-radius: 4px;
                                                                                                                                font-size: 12px;
                                                                                                                                white-space: nowrap;
                                                                                                                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                                                                                                            "
                                                                                                                        >
                                                                                                                            Hair
                                                                                                                            coloring</br>
                                                                                                                            available
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            `
                                                                                                          : ''}
                                                                                                      ${this
                                                                                                          ._selectedImage ===
                                                                                                      imageObj.path
                                                                                                          ? html`
                                                                                                                <div
                                                                                                                    class="selected-overlay"
                                                                                                                    style="
                                                                                                                    position: absolute;
                                                                                                                    top: 8px;
                                                                                                                    right: 8px;
                                                                                                                    width: 24px;
                                                                                                                    height: 24px;
                                                                                                                    background-color: #2680eb;
                                                                                                                    border-radius: 50%;
                                                                                                                    display: flex;
                                                                                                                    align-items: center;
                                                                                                                    justify-content: center;
                                                                                                                    "
                                                                                                                >
                                                                                                                    <svg
                                                                                                                        width="16"
                                                                                                                        height="16"
                                                                                                                        viewBox="0 0 24 24"
                                                                                                                        fill="none"
                                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                                    >
                                                                                                                        <path
                                                                                                                            d="M20 6L9 17L4 12"
                                                                                                                            stroke="white"
                                                                                                                            stroke-width="2"
                                                                                                                            stroke-linecap="round"
                                                                                                                            stroke-linejoin="round"
                                                                                                                        />
                                                                                                                    </svg>
                                                                                                                </div>
                                                                                                            `
                                                                                                          : ''}
                                                                                                  </div>
                                                                                              `
                                                                                          )
                                                                                        : ''}
                                                                                </div>
                                                                            </div>
                                                                        `
                                                                    )
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                class="section"
                                                style="padding-bottom:0px; padding-top:0px;"
                                            >
                                                <div
                                                    class="section-header"
                                                    style="margin-bottom: 0px;"
                                                >
                                                    <h2 class="section-title">
                                                        Select Hair Color
                                                    </h2>
                                                </div>

                                                <!-- Only show hair color selection UI if the selected image supports coloring -->
                                                ${
                                                    this._selectedImage === null
                                                        ? html`
                                                              <!-- Message when no hairstyle is selected -->
                                                              <div
                                                                  style="
                                                                    margin-top: 5px;
                                                                    height:48px;
                                                                    border:1px solid #efefef;
                                                                    color: #666;
                                                                    padding: 8px 0;
                                                                    display: flex;
                                                                    align-items: center;
                                                                    justify-content: center;
                                                                    border-radius: 4px;
                                                                "
                                                              >
                                                                  Please select
                                                                  a hairstyle
                                                                  first
                                                              </div>
                                                          `
                                                        : this
                                                              ._selectedImageSupportsColor
                                                        ? html`
                                                              <!-- select hair color -->
                                                              <!-- 스크롤 가능한 헤어 컬러 선택 -->
                                                              <div
                                                                  style="
                                                                        display: grid;
                                                                        grid-template-columns: repeat(7, 1fr);
                                                                        gap: 5px;
                                                                        width: 100%;
                                                                        padding-bottom: 8px;
                                                                        padding-top:3px;
                                                                    "
                                                              >
                                                                  ${this._hairColors.map(
                                                                      (
                                                                          color
                                                                      ) => {
                                                                          return html`
                                                                              <img
                                                                                  src="./images/HairColor/${color.fileName}"
                                                                                  style="
                                                                                        width: 100%;
                                                                                        aspect-ratio: 1;
                                                                                        border-radius: 20%;
                                                                                        object-fit: cover;
                                                                                        cursor: pointer;
                                                                                        width:35px;
                                                                                        box-shadow: ${this
                                                                                      ._selectedHairColor ===
                                                                                  color.key
                                                                                      ? '0 0 0 2px #2680eb'
                                                                                      : 'none'};
                                                                                         "
                                                                                  @click="${() =>
                                                                                      this._handleHairColorSelect(
                                                                                          color.key
                                                                                      )}"
                                                                                  alt="${color.name ||
                                                                                  `Hair color ${color.key}`}"
                                                                              />
                                                                          `
                                                                      }
                                                                  )}
                                                              </div>
                                                          `
                                                        : html`
                                                              <!-- Message when selected image doesn't support coloring -->
                                                              <div
                                                                  style="
                                                                         margin-top: 5px;
                                                                    height:48px;
                                                                    border:1px solid #efefef;
                                                                    color: #666;
                                                                    padding: 8px 0;
                                                                    display: flex;
                                                                    align-items: center;
                                                                    justify-content: center;
                                                                    border-radius: 4px;
                                                                    "
                                                              >
                                                                  This hairstyle
                                                                  doesn't
                                                                  support color
                                                                  changes.
                                                              </div>
                                                          `
                                                }
                                            </div>
                                        </div>
                                                <div
                                                    class="fixed-button-container"
                                                >
                                                    <div
                                                        class="flex flex-col"
                                                        style="width: 100%;"
                                                    >
                                                        <!-- Generated Images Section -->
                                                        <div
                                                            class="section"
                                                            style="border-top: none; position:relative;  margin-bottom:10px;  padding:0px; "
                                                        >
                                                            <div
                                                                class="section-header"
                                                                style="margin-top: 5px; margin-bottom: 6px;"
                                                            >
                                                                <h2
                                                                    class="section-title"
                                                                    style="margin-bottom:0px;"
                                                                >
                                                                    Generated
                                                                    images (${
                                                                        this
                                                                            ._generatedImages
                                                                            .length
                                                                    })
                                                                </h2>
                                                                <sp-link
                                                                    href="#"
                                                                    class="see-all"
                                                                    quiet
                                                                    @click=${(
                                                                        e: Event
                                                                    ) => {
                                                                        e.preventDefault()
                                                                        this._toggleShowAllImages()
                                                                    }}
                                                                    >See
                                                                    all</sp-link
                                                                >
                                                            </div>
                                                        </div>

                                                        
                                                        <!-- Create Rectangle button -->
                                                        <div
                                                            class="tooltip-wrapper"
                                                            style="width: 100%; position: relative;"
                                                        >
                                                            <sp-button
                                                                size="l"
                                                                @click=${
                                                                    this
                                                                        ._handleClick
                                                                }
                                                                ?disabled=${isButtonDisabled}
                                                                style="width:100%; text-align:center;"
                                                            >
                                                                Generate image
                                                                (${
                                                                    this
                                                                        .userAccessData
                                                                        ?.limitInfo
                                                                        .REMAINING_DAILY_IMAGE_GENERATION_LIMIT
                                                                }
                                                                left)
                                                                <sp-tooltip
                                                                    self-managed
                                                                    placement="top"
                                                                >
                                                                    You
                                                                           get
                                                                           ${
                                                                               this
                                                                                   .userAccessData
                                                                                   ?.limitInfo
                                                                                   .DAILY_IMAGE_GENERATION_LIMIT
                                                                           }
                                                                           free
                                                                           credit </br>
                                                                           every
                                                                           day
                                                                </sp-tooltip>
                                                            </sp-button>

                                                            ${
                                                                isButtonDisabled
                                                                    ? html`
                                                                          <div
                                                                              class="tooltip-container"
                                                                              style="position: absolute; top: 11px; right: 45px; z-index: 1000;"
                                                                          >
                                                                              <sp-help-text
                                                                                  style="cursor: help;"
                                                                                  onmouseover="this.nextElementSibling.style.display='block'"
                                                                                  onmouseout="this.nextElementSibling.style.display='none'"
                                                                              >
                                                                                  <sp-icon-info
                                                                                      slot="icon"
                                                                                      size="s"
                                                                                  ></sp-icon-info>
                                                                              </sp-help-text>
                                                                              <div
                                                                                  style="display: none; position: absolute; top: -50px; right: 0; background: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); width: 200px; text-align: center;"
                                                                              >
                                                                                  You
                                                                           get
                                                                           ${this.userAccessData?.limitInfo.DAILY_IMAGE_GENERATION_LIMIT}
                                                                           free
                                                                           credit </br>
                                                                           every
                                                                           day
                                                                              </div>
                                                                          </div>
                                                                      `
                                                                    : ''
                                                            }
                                                        </div>
                                                       

                                                       
                                                            
                                                </div>




                                    </div>
                                `}
                          </div>
                      `}
            </sp-theme>
        `
    }
}
