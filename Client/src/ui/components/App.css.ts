import { css } from 'lit'

export const style = css`
    * {
        box-sizing: border-box;
    }

    :host {
        display: block;
        height: 100vh;
        overflow: hidden;
        margin: 0;
        padding: 0;
    }

    :global(body) {
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
    }

    :global(html) {
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
    }
    .container {
        padding: 0;
        display: flex;
        flex-direction: column;
        font-family: adobe-clean, 'Source Sans Pro', -apple-system,
            BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        height: 100vh;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .section {
        padding: 0px 16px;
        padding-bottom: 12px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
    }

    .section-title {
        font-size: 16px;
        font-weight: 700;
        color: #2d3748;
        line-height: 20px;
        margin-bottom: 7px;
    }

    .image-categories {
        display: flex;
        flex-direction: column;
        gap: 32px;
    }

    .category {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .group {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .group-title {
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        margin: 0;
    }

    .image-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
    }

    .image-item {
        position: relative;
        cursor: pointer;
        border-radius: 16px;
        overflow: hidden;
        background: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 2px solid transparent;
    }

    .image-item img {
        width: 100%;
        height: auto;
        aspect-ratio: 3 / 4;
        object-fit: contain;
        display: block;
        border-radius: 14px;
    }

    .selected-overlay {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
    }

    .image-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15),
            0 10px 10px -5px rgba(0, 0, 0, 0.1);
    }

    .fixed-container {
        flex-shrink: 0;
        background: white;
        z-index: 100;
        width: 100%;
        border-bottom: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    .scrollable-content {
        padding: 12px;
        flex: 1;
        overflow-y: overlay;
        background: transparent;
    }

    .scrollable-content::-webkit-scrollbar {
        width: 11px;
    }

    .scrollable-content::-webkit-scrollbar-track {
        background: transparent;
    }

    .scrollable-content::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 6px;
        border: 1px solid transparent;
        background-clip: content-box;
    }

    .scrollable-content::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.3);
        background-clip: content-box;
    }

    /* 카테고리 dropdown 스타일링 */
    sp-picker {
        --spectrum-picker-border-radius: 12px !important;
        --spectrum-picker-border-color: transparent !important;
        --spectrum-picker-text-color: white !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    sp-picker::part(button) {
        background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 100%
        ) !important;
        border: none !important;
        border-radius: 16px !important;
        color: white !important;
        font-weight: 600 !important;
        padding: 12px 20px !important;
        min-height: 48px !important;
    }

    sp-picker[open]::part(button) {
        background: linear-gradient(
            135deg,
            #5a67d8 0%,
            #6b46c1 100%
        ) !important;
        transform: scale(0.98) !important;
    }

    /* 메뉴 아이템 스타일링 */
    sp-menu-item {
        --spectrum-menu-item-background-color: transparent !important;
        --spectrum-menu-item-background-color-hover: rgba(
            102,
            126,
            234,
            0.1
        ) !important;
        --spectrum-menu-item-background-color-selected: rgba(
            102,
            126,
            234,
            0.2
        ) !important;
        --spectrum-menu-item-text-color: #374151 !important;
        border-radius: 8px !important;
        margin: 4px 8px !important;
        font-weight: 500 !important;
        transition: all 0.2s ease !important;
    }

    sp-menu-item:hover {
        background: linear-gradient(
            90deg,
            rgba(102, 126, 234, 0.1) 0%,
            rgba(118, 75, 162, 0.1) 100%
        ) !important;
    }

    sp-menu-item[selected] {
        background: linear-gradient(
            90deg,
            rgba(102, 126, 234, 0.2) 0%,
            rgba(118, 75, 162, 0.2) 100%
        ) !important;
        color: #5a67d8 !important;
        font-weight: 600 !important;
    }

    /* 드롭다운 메뉴 컨테이너 */
    sp-popover {
        --spectrum-popover-border-radius: 16px !important;
        --spectrum-popover-border-color: transparent !important;
        box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.15),
            0 8px 16px -8px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(8px) !important;
        margin-top: 8px !important;
    }

    /* Button border color override */
    #button {
        border-color: var(
            --spectrum-textfield-border-color,
            var(--spectrum-alias-border-color)
        ) !important;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }

    .alert-banner {
        animation: fadeIn 0.5s forwards;
    }

    .alert-banner.fade-out {
        animation: fadeOut 0.5s forwards;
    }
`
