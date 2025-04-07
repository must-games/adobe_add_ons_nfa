import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('alert-banner')
export class AlertBanner extends LitElement {
    @property({ type: Boolean }) visible = false
    @property({ type: String }) message = ''
    // 'To generate an image, you must upload a photo and select a category or enter a custom prompt'

    static styles = css`
        .alert-banner {
            border-radius: 5px;
            z-index: 5000;
            position: relative;
            height: auto;
        }
    `

    render() {
        return this.visible
            ? html`
                  <sp-alert-banner
                      class="alert-banner"
                      open
                      variant="negative"
                      dismissible
                  >
                      ${this.message}
                  </sp-alert-banner>
              `
            : null
    }
}
