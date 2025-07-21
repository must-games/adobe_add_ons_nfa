import { css } from 'lit'

export const style = css`
    :host {
        display: block;
        height: 100%;
        overflow: hidden;
    }

    .container {
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-family: adobe-clean, 'Source Sans Pro', -apple-system,
            BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: relative;
    }

    .section {
        padding: 6px 16px;
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
        color: #222222;
        line-height: 20px;
        margin-top: 5px;
        margin-bottom: 7px;
    }

    .image-categories {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .category {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .image-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 9px;
    }

    .image-item {
        position: relative;
        cursor: pointer;
        border-radius: 4px;
        overflow: hidden;
    }

    .image-item img {
        width: 100%;
        height: auto;
        aspect-ratio: 3 / 4;
        object-fit: cover;
        display: block;
    }

    .image-item.selected {
        outline: 2px solid #2680eb;
    }

    .selected-overlay {
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
    }

    .image-item:hover {
        opacity: 0.9;
    }

    .fixed-container {
        position: relative;
        width: 100%;
    }

    .scrollable-content {
        overflow-y: auto;
        max-height: 70vh;
        padding: 10px 16px;
        padding-top: 8px;
    }

    .full-content {
        position: relative;
        width: 100%;
        padding: 16px;
        padding-bottom: 10px;
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
