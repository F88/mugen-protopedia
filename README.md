# MUGEN ProtoPedia (無限ProtoPedia)

[![CI](https://github.com/F88/mugen-protopedia/actions/workflows/ci.yml/badge.svg)](https://github.com/F88/mugen-protopedia/actions/workflows/ci.yml)
[![CodeQL](https://github.com/F88/mugen-protopedia/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/F88/mugen-protopedia/actions/workflows/github-code-scanning/codeql)
[![Copilot code review](https://github.com/F88/mugen-protopedia/actions/workflows/copilot-pull-request-reviewer/copilot-pull-request-reviewer/badge.svg)](https://github.com/F88/mugen-protopedia/actions/workflows/copilot-pull-request-reviewer/copilot-pull-request-reviewer)

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/F88/mugen-protopedia)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Endless prototypes. Instant inspiration. Explore a new ProtoPedia prototype on every tap.

## Features

- Browse and explore a wide variety of prototypes.
- View detailed information about each prototype, including images, descriptions, and specifications.
- Responsive design for optimal viewing on various devices.
- User-friendly interface for easy navigation.
- **PWA Support**: Install as a desktop or mobile app (A2HS: Add to Home screen) for enhanced user experience ([Learn more](./docs/pwa-implementation.md))

## Roadmap (ja)

### 優先度: 高

- 無限度を向上させる目的としてプレイモードの追加
    - 未知との遭遇モード (音と光を使ったコミュニケーション)
    - プロトタイプ・おぼえていますか モード (唐突にアイドルが歌い出す)
    - 巡り会いプロトタイプモード (ニュータイプ専用)
    - 他

### 優先度: 中

- タグやステータス、受賞履歴で絞り込める高度なフィルターと検索プリセットを導入する。
- 取得遅延やキャッシュヒット、ユーザー操作などの分析情報を可視化するダッシュボードを用意する。

### 優先度: 低

- 協調的に活用できる共有リンク付きプロトタイプコレクション機能を追加する。
- デモを円滑に行えるよう、取得済みプロトタイプのオフラインスナップショットを提供する。

## CHNAGELOG

### 2025-11-08

- 🎊 リリース

### 2025-11-09

- PWA 対応（A2HS）: Web App Manifest と Service Worker を整備し、デスクトップ/モバイルでインストール可能になりました。

## Tech Stack

### Frontend

- Next.js 15 (App Router / Server Functions)
- React 19

### UI

- Tailwind CSS 4.x
- shadcn/ui-based local components (see `components/ui/*`)
- lucide-react icons
- Icons should use either emojis or [Lucide](https://lucide.dev/).

### API Client

- [protopedia-api-v2-client - npm](https://www.npmjs.com/package/protopedia-api-v2-client)

### Tooling

- TypeScript 5.x
- ESLint (with `eslint-config-next`)
- Storybook 10
- GitHub Actions (CI)

### Logging

- pino (JSON structured logs)

### Testing

- Unit: Vitest
- E2E: Playwright
- Mocking: MSW
- Test data: `@faker-js/faker`

### Runtime

- Node.js 20+

### Hosting / Deployment

- Vercel
