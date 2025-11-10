# MUGEN ProtoPedia (無限 ProtoPedia)

[![CI](https://github.com/F88/mugen-protopedia/actions/workflows/ci.yml/badge.svg)](https://github.com/F88/mugen-protopedia/actions/workflows/ci.yml)
[![CodeQL](https://github.com/F88/mugen-protopedia/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/F88/mugen-protopedia/actions/workflows/github-code-scanning/codeql)
[![Copilot code review](https://github.com/F88/mugen-protopedia/actions/workflows/copilot-pull-request-reviewer/copilot-pull-request-reviewer/badge.svg)](https://github.com/F88/mugen-protopedia/actions/workflows/copilot-pull-request-reviewer/copilot-pull-request-reviewer)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/F88/mugen-protopedia)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Endless exploration of prototypes in [ProtoPedia](https://protopedia.net/). Instant inspiration. Tap (or press Enter) for a fresh prototype — infinite discovery awaits.

[ProtoPedia（プロトペディア）](https://protopedia.net/)に登録されているプロトタイプを API 経由で延々と探索。即座のインスピレーション。タップ（または Enter キー）で新しいプロトタイプを表示 — 無限の発見があなたを待っています。

## About ProtoPedia

[ProtoPedia](https://protopedia.net/) is a Japanese creative platform with the tagline "つくる、たのしむ、ひろがる" (Create, Enjoy, Expand). It serves as a community hub where makers, developers, and creators share their prototype projects across diverse categories:

- **Software Development**: Applications, games, AI/data science, blockchain, AR/VR
- **Hardware**: Electronics, robotics, wearables, IoT
- **Design/Art**: Visualization, interactive design, media art
- **Making/DIY**: Digital fabrication, woodworking, upcycling

This app leverages the ProtoPedia API to deliver an endless stream of inspiring prototypes from this vibrant maker community.

[ProtoPedia（プロトペディア）](https://protopedia.net/)は「つくる、たのしむ、ひろがる」をコンセプトにした日本のクリエイティブプラットフォームです。メイカー、開発者、クリエイターがプロトタイプ作品を共有するコミュニティハブとして、以下のような多様なカテゴリーの作品が集まっています：

- **ソフトウェア開発**: アプリ、ゲーム、AI/データサイエンス、ブロックチェーン、AR/VR
- **ハードウェア**: 電子工作、ロボティクス、ウェアラブル、IoT
- **デザイン/アート**: ビジュアライゼーション、インタラクティブデザイン、メディアアート
- **Making/DIY**: デジタルファブリケーション、木工、アップサイクル

このアプリは ProtoPedia API を活用して、活気あるメイカーコミュニティから生まれた刺激的なプロトタイプを無限に配信します。

## 特徴 / Key Features

- 📱 どこでも楽しめる / Enjoy Anywhere
    - スマートフォンなどの狭い画面でも快適に操作できるレスポンシブデザイン。通勤中や移動中でも、いつでもどこでもプロトタイプ探索を楽しめます。
    - Responsive design optimized for smartphones and narrow screens. Explore prototypes anytime, anywhere — during your commute or on the go.

- ⌨️ 最高の体験を / Premium Experience
    - 大きなスクリーンとキーボードショートカット（`Enter`, `j/k`, `r` など）で、デスクトップ環境でも最高の体験を提供。効率的なブラウジングで、より多くのプロトタイプに出会えます。
    - Enhanced for large screens with powerful keyboard shortcuts (`Enter`, `j/k`, `r`, etc.). Experience efficient browsing and discover more prototypes on desktop.

## Roadmap / 今後の方針

### 高 (High Priority)

- 新しい「プレイモード」で無限探索体験を強化
    - 未知との遭遇モード (音と光によるコミュニケーション)
    - プロトタイプ・おぼえていますか モード (唐突にアイドルが歌い出す)
    - 巡り会いプロトタイプモード (ニュータイプ専用)

### 中 (Medium)

- 分析ダッシュボードを高度化 (キャッシュヒット率 / レイテンシ時系列 / サイズ分布)
- 共有コレクションの下準備 (権限 & 永続化層検討)

### 低 (Low)

- オフラインスナップショットエクスポート (デモ用)
- コラボレーション向け共有リンク生成

## Features

### Core (ja)

- 無限のランダム探索 (`fetchRandomPrototype`、キャッシュ考慮のフォールバック)
- リスト取得・単一ID取得・ランダム選択のための決定的なサーバーアクション（`app/actions/prototypes.ts`）
- プロトタイプの正規化とメタデータ拡充 (タグ、メダル、バッジ、ハイライト)

### Core (en)

- Infinite random exploration (`fetchRandomPrototype`, cache-aware fallbacks)
- Deterministic server actions for list, single ID, random selection (`app/actions/prototypes.ts`)
- Prototype normalization & metadata enrichment (tags, medals, badges, highlights)

### Performance & Caching

Data fetch paths prefer cached snapshots; TTL expiry schedules async refresh without blocking response rendering.

## Performance & Fetch Strategy

Refer to [`docs/data-fetching-strategy.md`](./docs/data-fetching-strategy.md) for deeper rationale. Highlights:

- Large page responses exceed Next.js data cache ≈2 MB; strategy adapts page size to stay cacheable where beneficial.
- Response size + elapsed ms metrics logged for proactive capacity tuning.
- Random selection performed server-side to minimize client payload & preserve fairness.

## Keyboard Shortcuts

| Key                          | Action                         |
| ---------------------------- | ------------------------------ |
| `Enter`                      | Fetch random prototype         |
| `j / ArrowDown / ArrowRight` | Scroll next                    |
| `k / ArrowUp / ArrowLeft`    | Scroll previous                |
| `r`                          | Reset / clear list             |
| `o`                          | Open selected prototype detail |

Cooldown gating prevents rapid accidental repeats (`ACTION_COOLDOWN_MS`).

## Changelog

### 2025-11-09

- PWA 対応（A2HS）: Web App Manifest & Service Worker でインストール可能に

### 2025-11-08

- 🎊 初期リリース

## Documentation

- Development Guide: [`docs/development.md`](./docs/development.md)
- Data Fetching Strategy: [`docs/data-fetching-strategy.md`](./docs/data-fetching-strategy.md)

## License

MIT © F88. See [`LICENSE`](./LICENSE).
