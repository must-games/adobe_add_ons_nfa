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
        gap: 16px;
    }

    .image-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
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

    .image-item.selected {
        border: 2px solid #2563eb;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            0 0 0 4px rgba(37, 99, 235, 0.1);
        transform: translateY(-2px);
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
        overflow-y: auto;
        background: transparent;
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
