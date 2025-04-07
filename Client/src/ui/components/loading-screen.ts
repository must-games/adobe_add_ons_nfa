import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('loading-screen')
export class LoadingScreen extends LitElement {
    @property({ type: Number })
    progress = 30 // Default progress value (30%)

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
            </div>
        `
    }
}
