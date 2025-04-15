// import { css } from "lit";

// export const style = css`
//   .container {
//     margin: 24px;
//     display: flex;
//     flex-direction: column;
//   }
// `;

import { css } from 'lit'

export const style = css`
    .some-class {
        background-image: url('./pic1.png');
    }

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

    .header {
        background-color: #7b42cc;
        color: white;
        padding: 12px;
        font-weight: 500;
        width: 100%;
        font-size: 13px;
    }

    .header-text {
        font-size: 14px;
    }

    .header-text sp-link {
        color: white;
        text-decoration: underline;
    }

    .section {
        padding: 6px 16px;
        // border-top: 2px solid #e1e1e1;
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

    .see-all {
        font-size: 12px;
        line-height: 18px;
        font-weight: 400;
        text-decoration-line: none;
        color: rgb(2, 101, 220);
        margin-top: 5px;
    }
    .see-all:hover {
        text-decoration-line: underline;
    }
    .image-gallery {
        min-height: 100px;
        border-radius: 4px;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 10px;
        margin-top: 10px;
    }

    .empty-state {
        text-align: center;
        padding: 24px;
        color: #6e6e6e;
        font-size: 14px;
    }

    .dropzone {
        width: 100%;
        height: 120px;
        border: 2px dashed #cccccc;
        border-radius: 4px;
        cursor: pointer;
        padding: 0;
    }

    .dropzone-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #2c2c2c;
    }

    .upload-icon {
        color: #2c2c2c;
    }

    .upload-text {
        font-size: 13px;
        margin-bottom: 6px;
        color: #bdbdbd;
        line-height: 15px;
    }

    .flex-col {
        flex-direction: column;
    }

    .items-start {
        align-items: start;
    }
    .flex {
        display: flex;
    }
    .object-cover {
        object-fit: cover;
    }
    .rounded-lg {
        border-radius: 12px;
    }
    .flex-row {
        flex-direction: row;
    }
    .items-center {
        align-items: center;
    }
    .justify-center {
        justify-content: center;
    }
    .justify-between {
        justify-content: space-between;
    }
    .w-full {
        width: 100%;
    }
    .h-full {
        height: 100%;
    }

    //   select ima

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

    .category-title {
        font-size: 16px;
        font-weight: 900;
        color: #2c2c2c;
        margin-top: 5px;
        margin-bottom: 0px;
    }

    .image-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 9px;
    }

    .generated-image-item {
        position: relative;
        cursor: pointer;
        border-radius: 8px;
        overflow: hidden;
        width: 90px;
        height: 90px;
        object-fit: cover;
        cursor: grab;
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
    .theme-filter {
        margin-bottom: 16px;
    }

    sp-popover {
        border-width: 2px !important;
        border-color: #cccccc !important;
    }
    :host([open])
        #button:not(.spectrum-Picker--quiet, :disabled, .is-disabled) {
        border-width: 2px !important;
        border-color: #cccccc !important;
    }

    .fixed-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000; /* 다른 요소 위에 배치 */
        width: 100%;
    }

    .fixed-button-container {
        position: fixed;
        // bottom: 0;
        left: 0;
        right: 0;
        background: white;
        padding: 16px;
        padding-top: 0px;
        box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
        z-index: 3000; /* ✅ 다른 요소보다 더 위로 설정 */
        display: flex;
        justify-content: center; /* 버튼을 중앙 정렬 */
        bottom: 0;
    }

    .fixed-button-container sp-button {
        width: 100%;
        max-width: 500px; /* 버튼 크기 조절 (필요시 변경 가능) */
    }

    .full-gallery-header {
        display: flex;
        align-items: center;
        padding: 0 16px 16px 16px;
        border-bottom: 1px solid #e1e1e1;
        position: sticky;
        top: 0;
        background: white;
        z-index: 10;
    }

    .back-button {
        margin-right: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .full-gallery-content {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        padding: 16px;
        overflow-y: auto;
        max-height: calc(88vh - 140px);
    }

    .full-gallery-item {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
    }

    .full-gallery-item img {
        width: 100%;
        height: auto;
        aspect-ratio: 3/4;
        object-fit: cover;
        display: block;
    }

    .image-actions {
        position: absolute;
        top: 8px;
        right: 8px;
        background-color: white;
    }

    .drag-drop-hint {
        padding: 16px;
        color: #6e6e6e;
        font-size: 13px;
    }

    .clear-history-container {
        padding: 16px;
        position: sticky;
        bottom: 0;
        background: white;
    }
    .menu-item {
        padding: 4px 8px;
        cursor: pointer;
        font-size: 12px;
    }

    .menu-item:hover {
        background-color: #f5f5f5;
    }

    /* App.css */
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-20px); /* 위에서 아래로 나타나는 효과 */
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
            transform: translateY(-20px); /* 위로 사라지는 효과 */
        }
    }

    .alert-banner {
        animation: fadeIn 0.5s forwards; /* fadeIn 애니메이션 */
    }

    .alert-banner.fade-out {
        animation: fadeOut 0.5s forwards; /* fadeOut 애니메이션 */
    }

    .scrollable-content {
        position: absolute;
        top: 170px; /* 고정된 섹션 아래부터 시작 */
        left: 0;
        right: 0;
        bottom: 80px; /* 버튼과 겹치지 않도록 여유 공간 확보 */
        overflow-y: auto; /* 이 부분만 스크롤 가능 */
        height: calc(100vh - 480px); /* 전체 높이에서 고정된 섹션 높이 빼기 */
        padding: 10px 16px;
        margin-top: 30px;
        min-height: 130px;
        padding-top: 2px;
    }
    .full-content {
        position: relative;
        height: calc(100vh - 275px); /* 헤더와 하단 버튼 영역을 제외한 높이 */
        overflow-y: auto;
        padding-bottom: 10px;
    }
    .image-gallery-footer {
        text-align: center;
        font-size: 12px;
    }
`
