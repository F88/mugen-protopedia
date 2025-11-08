# MUGEN ProtoPedia (無限ProtoPedia)

[![CI](https://github.com/F88/mugen-protopedia/actions/workflows/ci.yml/badge.svg)](https://github.com/F88/mugen-protopedia/actions/workflows/ci.yml)
[![CodeQL](https://github.com/F88/mugen-protopedia/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/F88/mugen-protopedia/actions/workflows/github-code-scanning/codeql)
[![Copilot code review](https://github.com/F88/mugen-protopedia/actions/workflows/copilot-pull-request-reviewer/copilot-pull-request-reviewer/badge.svg)](https://github.com/F88/mugen-protopedia/actions/workflows/copilot-pull-request-reviewer/copilot-pull-request-reviewer)

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/F88/mugen-protopedia)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

'MUGEN ProtoPedia' is a web application that securely connects to the ProtoPedia API (v2) to retrieve and display a single, randomly selected prototype whenever the user requests one.

## Features

- Browse and explore a wide variety of prototypes.
- View detailed information about each prototype, including images, descriptions, and specifications.
- Responsive design for optimal viewing on various devices.
- User-friendly interface for easy navigation.

## Roadmap (ja)

### 優先度: 高

- プレイモードの追加
    - 未知との遭遇モード（星が曲がる演出や音楽再生など）を追加する。
    - 巡り会いプロトタイプモード（宇宙的な演出を伴う閲覧体験）を検討する。

### 優先度: 中

- タグやステータス、受賞履歴で絞り込める高度なフィルターと検索プリセットを導入する。
- 取得遅延やキャッシュヒット、ユーザー操作などの分析情報を可視化するダッシュボードを用意する。

### 優先度: 低

- 協調的に活用できる共有リンク付きプロトタイプコレクション機能を追加する。
- デモを円滑に行えるよう、取得済みプロトタイプのオフラインスナップショットを提供する。

## Technologies Used

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

### Logging

- pino (JSON structured logs)

### Testing

- Unit: Vitest
- E2E: Playwright
- Mocking: MSW
- Test data: `@faker-js/faker`

### Runtime

- Node.js 20+
