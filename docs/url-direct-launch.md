---
lang: en
title: URL Direct Launch
title-en: URL Direct Launch
title-ja: URL直接起動
related:
    - docs/*
instructions-for-ais:
    - This document should be written in English for AI readability.
    - Content within code fences may be written in languages other than English.
    - Prohibit updating this front-matter.
    - Prohibit updating title line (1st line) in this document.
---

# URL Direct Launch

This document defines the application behavior when launched via URL query parameters.

## Query Parameters

- `id`: Comma-separated list of IDs. IDs consist of numbers and are processed in the given order. Duplicates are allowed.
- `title`: Optional. The title to be displayed on the screen. Equivalent to a playlist title in music applications.

## Play Mode Determination

- If the validated `id` list is not empty, the play mode is initialized as `playlist`.
- If the `id` parameter does not exist or is determined to be empty due to validation failure, the play mode is initialized as `normal`.
- For the behavior of play modes themselves, refer to `docs/mugen-pp/play-mode.md`.

## Reference Implementation

- `lib/utils/resolve-play-mode.ts`
- `app/page.tsx`

## Playlist Examples

```text
#ヒーローズリーグ 2025 予選 in 第一部 (12) | 無限ProtoPedia
https://mugen-pp.vercel.app/?title=%23%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%82%BA%E3%83%AA%E3%83%BC%E3%82%B0+2025+%E4%BA%88%E9%81%B8+in+%E7%AC%AC%E4%B8%80%E9%83%A8&id=7103,6774,7680,6687,7690,7667,7761,7663,7803,7467,7759,7572
```

[\#ヒーローズリーグ 2025 予選 in 第一部 \(12\) \| 無限ProtoPedia](https://mugen-pp.vercel.app/?title=%23%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%82%BA%E3%83%AA%E3%83%BC%E3%82%B0+2025+%E4%BA%88%E9%81%B8+in+%E7%AC%AC%E4%B8%80%E9%83%A8&id=7103,6774,7680,6687,7690,7667,7761,7663,7803,7467,7759,7572)

```text
#ヒーローズリーグ 2025 予選 in 第二部 (10) | 無限ProtoPedia
https://mugen-pp.vercel.app/?title=%23%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%82%BA%E3%83%AA%E3%83%BC%E3%82%B0+2025+%E4%BA%88%E9%81%B8+in+%E7%AC%AC%E4%BA%8C%E9%83%A8&id=7734,7747,6834,7808,6841,7736,7724,7609,7529,7603
```

[\#ヒーローズリーグ 2025 予選 in 第二部 \(10\) \| 無限ProtoPedia](https://mugen-pp.vercel.app/?title=%23%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%82%BA%E3%83%AA%E3%83%BC%E3%82%B0+2025+%E4%BA%88%E9%81%B8+in+%E7%AC%AC%E4%BA%8C%E9%83%A8&id=7734,7747,6834,7808,6841,7736,7724,7609,7529,7603)

```text
#ヒーローズリーグ 2025 予選 in 第三部 (8) | 無限ProtoPedia
https://mugen-pp.vercel.app/?title=%23%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%82%BA%E3%83%AA%E3%83%BC%E3%82%B0+2025+%E4%BA%88%E9%81%B8+in+%E7%AC%AC%E4%B8%89%E9%83%A8&id=7652,7628,7702,7798,7752,7586,7785,7771
```

[\#ヒーローズリーグ 2025 予選 in 第三部 \(8\) \| 無限ProtoPedia](https://mugen-pp.vercel.app/?title=%23%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%82%BA%E3%83%AA%E3%83%BC%E3%82%B0+2025+%E4%BA%88%E9%81%B8+in+%E7%AC%AC%E4%B8%89%E9%83%A8&id=7652,7628,7702,7798,7752,7586,7785,7771)
