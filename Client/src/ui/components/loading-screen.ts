import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { cancelGenerateImage } from '../lib/router'
import { isDebugLog } from '../lib/config'

@customElement('loading-screen')
export class LoadingScreen extends LitElement {
    @property({ type: Number })
    progress = 30 // Default progress value (30%)

    @property({ type: String })
    userId = ''

    @property({ type: Number })
    workId = -1

    @property({ type: Boolean })
    nextCancelWork = false
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;
                width: 100%;
                position: fixed;
                top: 0;
                left: 0;
                background-color: #f9f9f9;
                z-index: 9999;
            }

            .loading-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 80%;
                max-width: 300px;
            }

            .title {
                font-size: 18px;
                font-weight: 600;
                color: #333333;
                margin-bottom: 20px;
                font-family: adobe-clean, 'Source Sans Pro', -apple-system,
                    BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background-color: #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 16px;
            }

            .progress-fill {
                height: 100%;
                background-color: #5c5cff;
                border-radius: 4px;
                transition: width 0.3s ease;
            }

            .message {
                font-size: 14px;
                color: #555555;
                text-align: center;
                font-family: adobe-clean, 'Source Sans Pro', -apple-system,
                    BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
        `
    }

    private async _handleCancel() {
        //이미지 업로드중이어서 아직 workId없을때
        if (!this.userId || this.workId === -1) {
            this.nextCancelWork = true
            console.warn(
                'userId or workId is missing',
                this.userId,
                this.workId
            )
            return
        }

        if (isDebugLog) {
            console.log(
                `Cancelling image generation with userId=${this.userId}, workId=${this.workId}`
            )
        }

        if (this.userId && this.workId >= 0) {
            const result = await cancelGenerateImage(this.userId, this.workId)
            if (isDebugLog) {
                console.log('result', JSON.stringify(result))
            }
            if (result.success === true) {
                console.log(`generateImageCanceled:${this.workId}`)
                this.dispatchEvent(
                    new CustomEvent('generation-cancelled', {
                        bubbles: true,
                        composed: true,
                        detail: { nextCancelWork: this.nextCancelWork },
                    })
                )
            } else {
                // 실패 시 에러 메시지를 포함한 새 이벤트 발생
                const errorMessage = `Failed to cancel image generation`
                this.dispatchEvent(
                    new CustomEvent('generation-failed', {
                        bubbles: true,
                        composed: true,
                        detail: { message: errorMessage },
                    })
                )
            }
        }
    }

    render() {
        return html`
            <div class="loading-container">
                <div class="title">Generating your image</div>
                <div class="progress-bar">
                    <div
                        class="progress-fill"
                        style="width: ${this.progress}%"
                    ></div>
                </div>
                <div class="message">
                    Just a moment, your image is being crafted!
                </div>
                ${this.workId >= 0
                    ? html`
                          <div style="margin-top: 24px;">
                              <sp-button
                                  variant="negative"
                                  style="
                                    background-color: #e57373;
                                    color: white;
                                    font-weight: bold;
                                    padding: 0px 44px;
                                    border-radius: 20px;
                                    font-size: 18px;
                                    text-transform: lowercase;
                                "
                                  @click=${this._handleCancel}
                              >
                                  Cancel
                              </sp-button>
                          </div>
                      `
                    : ''}
            </div>
        `
    }
}
