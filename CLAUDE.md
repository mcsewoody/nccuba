# 政大企家班網站 — CLAUDE.md

## 專案簡介

國立政治大學企業家管理發展進修班（政大企家班，NCCU BA）的官方校友會網站，含前台公開網頁與後台幹部管理系統。

**前台** (`index.html`)：公開給歷屆學員、校友、以及有意報名的企業家瀏覽。內容包含最新公告、近期活動、捐款芳名錄、活動剪影。

**後台** (`ba_admin_index.html`)：幹部專用管理介面，可管理公告、行事曆、捐款芳名錄、活動剪影、帳號。目前有 admin（管理者）與 editor（幹部）兩種角色。

## 技術架構

- **純靜態 HTML/CSS/JS**，不使用任何前端框架（不引入 Vue / React）
- **Firebase**：Firestore（資料庫）、Firebase Auth（身份驗證）、Firebase Storage（檔案）
- **部署**：GitHub Pages（靜態託管）
- **現況**：資料層目前用 `localStorage` 模擬（`DB_KEY = 'nccuba_admin_demo'`），`seed` 資料中有示範內容；正式接 Firebase 後 demo 帳號失效

## 檔案結構（現況）

```
nccu_ba/
├── index.html           # 前台（公開網站）
├── ba_admin_index.html  # 後台管理（幹部登入）
└── CLAUDE.md
```

後續預計加入子頁面（關於企家班、校友列表、課程、招生等）。

## 設計規範

### 色彩系統
```css
--navy:      #1b3a5b   /* 主色：深藍 */
--navy-dark: #13293f   /* 深色：頁尾、側欄背景 */
--blue:      #2c5f8a   /* 連結藍 */
--gold:      #b8860b   /* 點綴金（重要標籤、分隔線） */
--line-green:#06c755   /* Line 品牌綠 */
--bg:        #ffffff
--bg-soft:   #f4f6f9
--text:      #2b2b2b
--text-soft: #5a5a5a
--border:    #e2e6ec
```

### 字型
`"Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif` — 繁體中文優先，不引入 Google Fonts 或 CDN 字型。

### 後台色彩（額外）
```css
--sidebar:   #13293f
--ok:        #27ae60
--danger:    #c0392b
```

### 原則
- 色調沉穩、專業，符合「華人世界第一總裁班」的高端定位
- 不隨意加動畫或花俏效果
- 中文介面，所有標籤、提示文字均用繁體中文

## 開發準則

### 語言與編碼
- 介面語言一律繁體中文
- HTML `lang="zh-Hant"`
- 所有使用者可見文字用繁體中文，程式變數、函式名可用英文

### 程式碼風格
- JavaScript：純 ES6+，不使用 TypeScript，不加 build step
- CSS：在 `<style>` 標籤內，維持現有 CSS Variables 命名
- 一個 HTML 檔案包含樣式（`<style>`）與腳本（`<script>`），保持自包含
- 不引入外部 CSS framework（Bootstrap、Tailwind 等）
- 不加不必要的 comment；邏輯複雜處才加一行說明

### Firebase 整合（待完成）
- 用 Firebase SDK (ESM 模組方式) 引入，不用 CDN compat 版
- Firestore collection 命名：`announcements`、`events`、`donations`、`galleries`、`users`（與現有 `seed` 欄位對齊）
- Firebase Auth：Email/Password 登入，對應後台帳號
- GitHub Pages 是靜態環境，Firebase config 可寫在前端（public key 正常），但 Firestore Security Rules 必須正確設定

### 安全性
- 後台入口由 Firebase Auth 把守，未登入不得讀寫資料
- Firestore Rules：`announcements`、`events`、`donations`、`galleries` 允許未登入讀取（前台需要）；寫入需登入且驗證角色
- 不把 Firebase Service Account 或任何 secret 放進前端
- `admin` 角色：完整存取；`editor` 角色：不得操作使用者管理

## 待辦路線圖（優先順序）

1. **Firebase Auth 整合** — 取代 demo 帳號，使用真實 Email/Password 登入
2. **Firestore 資料層** — 取代 `localStorage`，後台 CRUD 寫入 Firestore
3. **前台動態化** — `index.html` 從 Firestore 讀取公告、活動、捐款、剪影並渲染
4. **子頁面展開** — 關於企家班、校友專訪、課程資訊、招生專區等導覽列項目

## 使用者與角色

| 角色 | 帳號 | 權限 |
|------|------|------|
| admin（管理者） | 會長（你）及授權人 | 所有功能含使用者管理 |
| editor（幹部） | 各屆幹部 | 公告、活動、捐款、剪影的 CRUD；不含使用者管理 |

後台側欄的「使用者管理」僅 admin 看得到。

## AI 協作原則

- **小改動**（樣式調整、文字修改、欄位新增）：直接動手，不需事先說明
- **大改動**（架構調整、Firebase 整合、新頁面、資料結構異動）：先描述方案、說明影響，等你確認後再實作
- 保持繁體中文介面與現有設計一致性
- 不自行新增 dependency 或 build tool，除非你明確要求
