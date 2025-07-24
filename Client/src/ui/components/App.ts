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

import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { DocumentSandboxApi } from '../../models/DocumentSandboxApi'
import { style } from './App.css'

// Add this import for the picker component
import '@spectrum-web-components/picker/sp-picker.js'
import '@spectrum-web-components/menu/sp-menu-item.js'

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
import { userAccess, agreeTOS, clickImage, downloadFile } from '../lib/router'
import './loading-screen'
import './AlertBanner'
import './TermsAgreement'

@customElement('add-on-app')
export class App extends LitElement {
    @property({ type: Object })
    addOnUISdk!: AddOnSDKAPI

    @state()
    private _sandboxProxy!: DocumentSandboxApi

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
    private _userId = ''

    static get styles() {
        return style
    }

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

        this._userId = await addOnUISdk.app.currentUser.userId()
        await this._updateUserAccessData()

        // 약관 동의 이벤트 리스너 추가
        document.addEventListener(
            'terms-agreed',
            this._handleTermsAgreed.bind(this)
        )

        if (isDebugLog) {
            console.log(`=== _updateUserAccessData START ===`)
            console.log(`userId: ${this._userId}`)
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
                    const draggedImageSrc = (eventData.element as HTMLImageElement).src
                    const match = draggedImageSrc.match(/\/([^\/?#]+)\.png$/i);
                    if (!match) return null;

                    const fullName = match[1]; // ex) "Cat_5"
                    const baseName = fullName.split('_')[0]; // ex) "Cat"
                    clickImage(this._userId, fullName, baseName)

                    if (isDebugLog) {
                        console.log(
                            `The drag event has ended for ${draggedImageSrc}`
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
            'terms-agreed',
            this._handleTermsAgreed.bind(this)
        )
    }

    async updated(): Promise<void> {
        if (isDebugLog) {
            console.log(`updated`)
        }
    }

    private _handleImageLoad(event) {
        //https://developer.adobe.com/express/add-ons/docs/guides/develop/how_to/drag_and_drop/
        const target = event.currentTarget as HTMLImageElement
        const imagePath = target.dataset.imagePath || ''
        const imageUrl = `./images/${imagePath}`

        // 절대 URL 생성
        const absoluteImageUrl = new URL(imageUrl, window.location.href).href

        if (isDebugLog) {
            // console.log(
            //     `handleImageLoad for ${imagePath}, imageUrl=${imageUrl}, absoluteUrl=${absoluteImageUrl}`
            // )
        }

        try {
            addOnUISdk.app.enableDragToDocument(event.currentTarget, {
                previewCallback: (element: HTMLElement) => {
                    // 드래그된 요소에서 직접 경로 정보 가져오기
                    const elementImagePath =
                        (element as HTMLImageElement).dataset.imagePath || ''
                    const elementImageUrl = `./images/${elementImagePath}`
                    const elementAbsoluteUrl = new URL(
                        elementImageUrl,
                        window.location.href
                    ).href

                    if (isDebugLog) {
                        console.log(
                            `handleImageDrag previewCallback for path: ${elementImagePath}, url: ${elementAbsoluteUrl}`
                        )
                    }

                    return new URL(elementAbsoluteUrl)
                },
                completionCallback: async (element: HTMLElement) => {
                    // 드래그된 요소에서 직접 경로 정보 가져오기
                    const elementImagePath =
                        (element as HTMLImageElement).dataset.imagePath || ''
                    const elementImageUrl = `./images/${elementImagePath}`
                    const elementAbsoluteUrl = new URL(
                        elementImageUrl,
                        window.location.href
                    ).href
                    const draggedImageSrc = (element as HTMLImageElement).src

                    // data 속성에서 가져온 올바른 URL 사용
                    const imageBlob = await downloadFile(elementAbsoluteUrl)

                    if (isDebugLog) {
                        console.log(
                            `Downloaded blob for: ${elementAbsoluteUrl}`
                        )
                    }

                    return [{ blob: imageBlob }]
                },
            })
        } catch (e) {
            console.error(`_handleImageLoad e=${e}`)
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

    private async _handleImageSelect(
        image: string,
        imageKey: string,
        imageGroup: string
    ) {
        if (this._selectedImage === image) {
            this._selectedImage = null
            this._selectedImageKey = null
        } else {
            this._selectedImage = image
            this._selectedImageKey = imageKey
        }

        if (isDebugLog) {
            console.log(
                `_handleImageSelect.Selected Image: ${this._selectedImage}, Selected Image Key: ${this._selectedImageKey}`
            )
        }

        // 이미지 사용 기록
        const fileNameWithExt = image.split('/').pop() ?? ''
        const imageId = fileNameWithExt.replace(/\.[^/.]+$/, '')

        await clickImage(this._userId, imageId, imageGroup)

        this.requestUpdate()
    }

    // 사용자 접근 데이터 업데이트 함수 추가
    private async _updateUserAccessData() {
        if (isDebugLog) {
            console.log(`_updateUserAccessData`)
        }

        const userAccessData = await userAccess(this._userId)
        this.userAccessData = userAccessData

        if (isDebugLog) {
            console.log(`userAccessData=${JSON.stringify(userAccessData)}`)
            console.log(`userAccessData set:`, this.userAccessData)
            console.log(`isTOSAgreed: ${this.userAccessData.user.isTOSAgreed}`)
        }

        if (this.userAccessData.user.isTOSAgreed) {
            console.log('User already agreed to terms, skipping terms screen')
        } else {
            console.log('User needs to agree to terms')
        }

        if (userAccessData == null || userAccessData.user == null) {
            if (isDebugLog) {
                console.error('Failed to get user access data:', userAccessData)
            }
            this._showAlertBanner(
                `Unable to retrieve user information.
                Please refresh the page or send feedback.`,
                1000 * 60 * 60 * 24
            )
            return
        }

        this.requestUpdate()
    }

    // 약관 동의 핸들러
    private async _handleTermsAgreed() {
        // 약관 동의 완료 후 사용자 데이터를 다시 가져와서 UI 업데이트
        await this._updateUserAccessData()
    }

    // 비디오 링크 클릭 핸들러
    private _handleVideoLinkClick() {
        try {
            window.open('https://youtu.be/Y21ZqC8-gOI', '_blank')
        } catch (error) {
            console.error('Failed to open video link:', error)
        }
    }

    render() {
        // userId가 설정되지 않았으면 로딩 표시
        if (!this._userId || !this.userAccessData) {
            return html`<div
                style="display: flex; justify-content: center; align-items: center; height: 100vh;background-color:white;"
            >
                Loading...
            </div>`
        }

        // 서버에서 약관 동의 상태를 확인하여 결정
        const shouldShowTerms = !this.userAccessData.user.isTOSAgreed

        // if (shouldShowTerms) {
        //     return html`<terms-agreement
        //         .userId="${this._userId}"
        //     ></terms-agreement>`
        // }

        return html`
            <sp-theme theme="express" color="light" scale="medium">
                ${this.alertVisible
                    ? html` <alert-banner .visible="${this.alertVisible}"
                      .message="${this.alertMessage}"/ >`
                    : null}
                <!-- Header -->
                <sp-top-nav class="header" style="display:block;">
                    <div
                        class="video-link"
                        @click=${this._handleVideoLinkClick}
                    >
                        Video Link for Non Fungible Animals
                    </div>
                </sp-top-nav>
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
                                                                                          group.group
                                                                                      )}
                                                                                  style="cursor: pointer;"
                                                                              >
                                                                                  <img
                                                                                      src="${`./images/${imageObj.path}`}"
                                                                                      alt="Image"
                                                                                      data-image-path="${imageObj.path}"
                                                                                      @load=${this
                                                                                          ._handleImageLoad}
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
