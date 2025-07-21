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
    private _selectedTheme = 'All'

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
            if (isDebugLog) {
                console.log(
                    `this._generatedImages=${JSON.stringify(
                        this._generatedImages
                    )}`
                )
                console.log(
                    `this.completedImages=${JSON.stringify(completedImages)}`
                )
            }
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
                if (isDebugLog) {
                    console.log(
                        'The drag event has started for',
                        eventData.element
                    )
                }
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

    // 경고창을 표시하는 메서드
    private _showAlertBanner(message: string, timeout = 5000) {
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
        }, timeout) // 5초 후에 fade-out 시작
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
                if (isDebugLog) {
                    console.log('Download image:', img)
                }
                this._downloadImage(img)
                break
            case 'preview':
                if (isDebugLog) {
                    console.log('Open preview for:', img)
                }
                this._openPreviewModal(img)
                break
            case 'delete':
                if (isDebugLog) {
                    console.log('Delete image:', img)
                }
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
            if (isDebugLog) {
                console.log('파일 저장 완료')
            }
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
                if (isDebugLog) {
                    console.error('일부 이미지 삭제 실패')
                }
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

        this._generateDisabledTooltip = `Loading...`
        const userAccessData = await userAccess(this._userId)

        if (userAccessData == null || userAccessData.user == null) {
            if (isDebugLog) {
                console.log(
                    `userAccessData : ${JSON.stringify(userAccessData)}`
                )
                console.log(`userAccessData.user  : ${userAccessData.user}`)
            }
            this._showAlertBanner(
                `Unable to retrieve user information.
                Please refresh the page or send feedback.`,
                1000 * 60 * 60 * 24
            )

            this._generateImageMessage = `Retrive user information failed`
            this._generateDisabledTooltip = `Something went wrong. Please refresh the page or send feedback.`
            return
        }

        this.userAccessData = userAccessData
        //REMAINING_DAILY_IMAGE_GENERATION_LIMIT 가 0보다 작으면 0으로 설정
        if (
            this.userAccessData.limitInfo
                .REMAINING_DAILY_IMAGE_GENERATION_LIMIT < 0
        ) {
            this.userAccessData.limitInfo.REMAINING_DAILY_IMAGE_GENERATION_LIMIT = 0
        }
        this.userAccessData.limitInfo.REMAINING_DAILY_IMAGE_GENERATION_LIMIT =
            this.userAccessData.limitInfo.DAILY_IMAGE_GENERATION_LIMIT -
            this.userAccessData.user.imagesGeneratedToday

        // this.userAccessData.user = await getUser(this._userId)
        // this.userAccessData.user.imagesGeneratedToday =
        //     this.userAccessData.user.imagesGeneratedToday

        this._generateImageMessage = `Generating image (${this.userAccessData?.limitInfo.REMAINING_DAILY_IMAGE_GENERATION_LIMIT} left)`
        this._generateDisabledTooltip = `You get ${this.userAccessData?.limitInfo.DAILY_IMAGE_GENERATION_LIMIT} free credit every day`

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
                ${
                    this.alertVisible
                        ? html` <alert-banner .visible="${this.alertVisible}"
                          .message="${this.alertMessage}"/ >`
                        : null
                }
                ${
                    this._isLoading
                        ? html`<loading-screen
                              progress="${this._loadingProgress}"
                              workId="${this._workId}"
                              userId="${this._userId}"
                              title="${this._loadingTitle}"
                              @generation-cancelled="${this
                                  ._handleGenerationCancelled}"
                              @generation-failed="${this
                                  ._handleGenerationFailed}"
                          ></loading-screen>`
                        : html`
                              <div class="container">
                                  <!-- 기존 화면 -->
                                  <div
                                      class="fixed-container"
                                      style="position:fixed; top:0; left:0; right:0;"
                                  >
                                      <div class="full-content">
                                          <!-- Select Category Section -->
                                          <div
                                              class="section"
                                              style="padding-bottom:0px; padding-top:0px;"
                                          >
                                              <div
                                                  class="section-header"
                                                  style="margin-bottom: 0px;"
                                              >
                                                  <h2 class="section-title">
                                                      Category
                                                  </h2>
                                              </div>

                                              <!-- Category Dropdown -->
                                              <div
                                                  style="
                                                        margin-top: 4px;
                                                        margin-bottom: 8px;
                                                    "
                                              >
                                                  <sp-picker
                                                      label="Select Category"
                                                      value="${this
                                                          ._selectedTheme}"
                                                      @change="${(
                                                          e: CustomEvent
                                                      ) => {
                                                          this._selectedTheme =
                                                              (
                                                                  e.target as any
                                                              ).value
                                                          this.requestUpdate()
                                                      }}"
                                                      style="width: 100%;"
                                                  >
                                                      <sp-menu-item value="All"
                                                          >All</sp-menu-item
                                                      >
                                                      <sp-menu-item
                                                          value="Common"
                                                          >Common
                                                          Animals</sp-menu-item
                                                      >
                                                      <sp-menu-item
                                                          value="Endangered"
                                                          >Endangered
                                                          Animals</sp-menu-item
                                                      >
                                                  </sp-picker>
                                              </div>

                                              <!-- 스크롤 가능한 이미지 목록 -->
                                              <div class="scrollable-content">
                                                  <div class="image-categories">
                                                      ${
                                                          // _imageCategories 객체를 순회하여,
                                                          // 현재 _selectedTheme에 따라 카테고리 필터링
                                                          Object.entries(
                                                              this
                                                                  ._imageCategories
                                                          )
                                                              .filter(
                                                                  ([
                                                                      category,
                                                                  ]) =>
                                                                      // 'All' 일 경우 전체 표시, 그렇지 않으면 _selectedTheme와 동일한 것만 표시
                                                                      this
                                                                          ._selectedTheme ===
                                                                          'All' ||
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
                                                                                                                            src="./images/pal3.png" 
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
                                  </div>
                                  <div class="fixed-button-container">
                                      <div
                                          class="flex flex-col"
                                          style="width: 100%;"
                                      ></div>
                                  </div>
                              </div>
                          `
                }
                          </div>
            </sp-theme> `
    }
}
