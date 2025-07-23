import { LitElement, html, css } from 'lit'
import { customElement, state, property } from 'lit/decorators.js'
import { agreeTOS } from '../lib/router'

@customElement('terms-agreement')
export class TermsAgreement extends LitElement {
    @property({ type: String })
    userId: string = ''

    @state()
    private _termsReviewed = false

    static get styles() {
        return css`
            :host {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #f0f0f0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, sans-serif;
            }

            .terms-container {
                background: white;
                border-radius: 16px;
                padding: 22px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                text-align: center;
                margin: 20px;
            }

            .video-container {
                width: 100%;
                margin: 0 0 16px 0;
                border-radius: 8px;
                overflow: hidden;
            }

            .video-container video {
                width: 100%;
                min-height: 120px;
                border-radius: 8px;
                object-fit: contain;
            }

            .terms-content {
                font-size: 14px;
                color: #666;
                line-height: 1.6;
                margin: 0 0 32px 0;
                text-align: left;
            }

            .button-container {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .review-button {
                background: white;
                border: 1px solid #ddd;
                border-radius: 24px;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 500;
                color: #333;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .review-button:hover {
                border-color: #999;
                background: #f8f8f8;
            }

            .agree-button {
                background: #8a4fff;
                border: none;
                border-radius: 24px;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 500;
                color: white;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .agree-button:disabled {
                background: #ccc;
                cursor: not-allowed;
                opacity: 0.6;
            }

            .agree-button:not(:disabled):hover {
                background: #7a3fee;
            }
        `
    }

    private _handleReviewTerms() {
        const termsUrl = 'https://tos.nfa.mustg.kr/index.html'
        window.open(termsUrl, '_blank')
        this._termsReviewed = true
    }

    private async _handleAgreeAndContinue() {
        if (this._termsReviewed) {
            try {
                console.log(`Agreeing to terms for userId: ${this.userId}`)

                if (!this.userId) {
                    console.error('userId is empty, cannot agree to terms')
                    return
                }

                // 서버에 약관 동의 상태 저장
                const result = await agreeTOS(this.userId, true)
                console.log('Successfully agreed to terms:', result)

                // 성공하면 부모 앱에 약관 동의 완료를 알림
                this.dispatchEvent(
                    new CustomEvent('terms-agreed', {
                        bubbles: true,
                        composed: true,
                    })
                )
            } catch (error) {
                console.error('Failed to agree to terms:', error)
                // 에러 발생시에도 일단 진행하도록 함 (서버에 저장되었을 가능성)
                this.dispatchEvent(
                    new CustomEvent('terms-agreed', {
                        bubbles: true,
                        composed: true,
                    })
                )
            }
        }
    }

    render() {
        return html`
            <div class="terms-container">
                <div class="video-container">
                    <video controls autoplay>
                        <source src="assets/NFA_animals.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div class="terms-content">
                    This add-on allows you to use the materials provided by
                    MUSTGAMES in Adobe Express. The copyright for the materials
                    provided through this add-on belongs to MUSTGAMES. Before
                    using this add-on, please make sure to review and agree to
                    MUSTGAMES's Terms of Use.
                </div>

                <div class="button-container">
                    <button
                        class="review-button"
                        @click=${this._handleReviewTerms}
                    >
                        Review the Terms of Use
                    </button>

                    <button
                        class="agree-button"
                        ?disabled=${!this._termsReviewed}
                        @click=${this._handleAgreeAndContinue}
                    >
                        Agree and continue
                    </button>
                </div>
            </div>
        `
    }
}
