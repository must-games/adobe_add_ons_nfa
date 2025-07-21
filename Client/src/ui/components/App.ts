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
import './TermsAgreement'
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

    @state()
    private _termsAgreed = false

    // 카테고리 데이터를 초기화하는 메서드
    private initializeImageCategories(data: any) {
        const categories = {}
        data.category_list.forEach((category: string) => {
            categories[category] = data[category] || [] // 각 카테고리의 이미지를 가져옴
        })
        return categories
    }

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

        // body 스타일 직접 적용
        document.body.style.margin = '0'
        document.body.style.padding = '0'
        document.body.style.overflow = 'hidden'
        document.documentElement.style.margin = '0'
        document.documentElement.style.padding = '0'
        document.documentElement.style.overflow = 'hidden'

        // :host 배경색 직접 적용
        ;(this as any).style.backgroundColor = '#3232328a'

        // 전역 클릭 이벤트 리스너 추가
        document.addEventListener('click', this._handleGlobalClick.bind(this))

        // 약관 동의 이벤트 리스너 추가
        document.addEventListener(
            'terms-agreed',
            this._handleTermsAgreed.bind(this)
        )

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
        document.removeEventListener(
            'terms-agreed',
            this._handleTermsAgreed.bind(this)
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

    // 약관 동의 핸들러
    private _handleTermsAgreed() {
        this._termsAgreed = true
        this.requestUpdate()
    }

    render() {
        // 약관에 동의하지 않았으면 약관 동의 화면 표시
        if (!this._termsAgreed) {
            return html`<terms-agreement></terms-agreement>`
        }

        return html`
            <sp-theme theme="express" color="light" scale="medium">
                ${this.alertVisible
                    ? html` <alert-banner .visible="${this.alertVisible}"
                      .message="${this.alertMessage}"/ >`
                    : null}
                <div class="container">
                    <!-- Category 고정 영역 -->
                    <div class="fixed-container">
                        <!-- Select Category Section -->
                        <div class="section">
                            <div
                                class="section-header"
                                style="margin-bottom: 0px;"
                            >
                                <h2 class="section-title">Category</h2>
                            </div>

                            <!-- Category Dropdown -->
                            <div
                                style="
                                                    margin-top: 4px;
                                                "
                            >
                                <sp-picker
                                    label="Select Category"
                                    value="${this._selectedTheme}"
                                    @change="${(e: CustomEvent) => {
                                        this._selectedTheme = (
                                            e.target as any
                                        ).value
                                        this.requestUpdate()
                                    }}"
                                    style="width: 100%;"
                                >
                                    <sp-menu-item value="All">All</sp-menu-item>
                                    <sp-menu-item value="Common"
                                        >Common Animals</sp-menu-item
                                    >
                                    <sp-menu-item value="Endangered"
                                        >Endangered Animals</sp-menu-item
                                    >
                                </sp-picker>
                            </div>
                        </div>
                    </div>

                    <!-- 스크롤 가능한 이미지 목록 -->
                    <div class="scrollable-content">
                        <div class="image-categories">
                            ${
                                // _imageCategories 객체를 순회하여,
                                // 현재 _selectedTheme에 따라 카테고리 필터링
                                Object.entries(this._imageCategories)
                                    .filter(
                                        ([category]) =>
                                            // 'All' 일 경우 전체 표시, 그렇지 않으면 _selectedTheme와 동일한 것만 표시
                                            this._selectedTheme === 'All' ||
                                            this._selectedTheme === category
                                    )
                                    .map(
                                        ([category, groups]) => html`
                                            <div class="category">
                                                ${Array.isArray(groups)
                                                    ? groups.map(
                                                          (group) => html`
                                                              <div
                                                                  class="group"
                                                              >
                                                                  <h3
                                                                      class="group-title"
                                                                  >
                                                                      ${group.group}
                                                                  </h3>
                                                                  <div
                                                                      class="image-grid"
                                                                  >
                                                                      ${group.items.map(
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
                                                                                          false
                                                                                      )}
                                                                                  style="cursor: pointer;"
                                                                              >
                                                                                  <img
                                                                                      src="${`./images/${imageObj.path}`}"
                                                                                      alt="Image"
                                                                                      @load=${this
                                                                                          ._handleImageDrag}
                                                                                      @click=${(
                                                                                          e: MouseEvent
                                                                                      ) =>
                                                                                          this._handleDoubleClick(
                                                                                              e
                                                                                          )}
                                                                                  />
                                                                              </div>
                                                                          `
                                                                      )}
                                                                  </div>
                                                              </div>
                                                          `
                                                      )
                                                    : ''}
                                            </div>
                                        `
                                    )
                            }
                        </div>
                    </div>
                </div>
            </sp-theme>
        `
    }
}
