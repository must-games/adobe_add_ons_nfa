import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('terms-agreement')
export class TermsAgreement extends LitElement {
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
                padding: 32px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                text-align: center;
                margin: 20px;
            }

            .terms-title {
                font-size: 20px;
                font-weight: 600;
                color: #333;
                margin: 0 0 16px 0;
                line-height: 1.4;
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
        const termsUrl = 'https://kkusa.mustg.kr/en/tos_kstylo/'
        window.open(termsUrl, '_blank')
        this._termsReviewed = true
    }

    private async _handleAgreeAndContinue() {
        if (this._termsReviewed) {
            this.dispatchEvent(
                new CustomEvent('terms-agreed', {
                    bubbles: true,
                    composed: true,
                })
            )
        }
    }

    render() {
        return html`
            <div class="terms-container">
                <h1 class="terms-title">
                    Please review the Terms of Use for MUSTGAMES
                </h1>

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
