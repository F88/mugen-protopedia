# Mugen ProtoPedia Analysis Feature Expansion Ideas

## "Celebrating the Release"

This document outlines ideas for expanding the analysis capabilities of Mugen ProtoPedia.
The core philosophy is to provide unique insights that differ from the official ProtoPedia site, focusing specifically on the **"Release Date"** and the **"Drama"** behind the creation process.

### Core Philosophy

1. **Respect the "Release":** Place the highest value on the fact that a prototype was released.
2. **Beyond Search:** Provide analytical insights into "Time," "Trends," and "Community Dynamics," rather than just search or categorization.
3. **Visualize History:** Visualize the "Ecology" and "History" of the prototyping community.

---

### Analysis Idea List

#### 1. Time-Focused Analysis (作成日・リリース日・更新日に着目)

- **Maker's Rhythm (メイカーの活動リズム)**
    - **Concept:** Visualize the life cycle of makers.
    - **Logic:** Aggregate release counts by "Day of Week" and "Month".
    - **Insight:** Are there more "Weekend Hackers" (Sat/Sun) or "Weekday Warriors"? Is there a seasonal trend (e.g., Summer Vacation, End of Year)?
    - **Fun Factor:** ⭐⭐⭐ (Relatable "lifestyle" data)
    - **Difficulty:** Low (Simple aggregation)

- **The Holy Day (聖なる日)**
    - **Concept:** Identify the specific date with the historically highest number of releases.
    - **Logic:** Aggregate releases by `MM-DD` across all years and rank them.
    - **Insight:** Identify special days for the community (e.g., "Hack Day", "Christmas Eve Hack").
    - **Fun Factor:** ⭐⭐⭐⭐ (Creates a reason to celebrate specific days)
    - **Difficulty:** Low-Medium

- **The Eternal Flame (継続の灯火 / Streaks)**
    - **Concept:** Respect for the continuity of creation. "Don't let the flame die."
    - **Logic:**
        - Calculate the longest streak of consecutive days with at least one release across the entire platform history.
        - Calculate the _current_ active streak (how many days in a row up to today).
    - **Insight:** Visualizes the "infinite" chain of creation. Encourages the community to keep releasing.
    - **Fun Factor:** ⭐⭐⭐⭐⭐ (Gamification for the whole community)
    - **Difficulty:** Medium (Requires date sequence logic)

- **Incubation Period (潜伏期間 / Speed of Creation)**
    - **Concept:** Visualize the struggle and speed of bringing ideas to life.
    - **Logic:** Calculate the duration between `createDate` (Registration) and `releaseDate` (Publish).
        - Distinguish between "Hackathon Type" (Same day) vs "Long-term Projects".
    - **Insight:** Users can compare their pace with the community average.
    - **Fun Factor:** ⭐⭐⭐⭐ (Reveals development styles)
    - **Difficulty:** Medium (Requires careful timestamp handling)

- **The Power of Deadlines (締切の魔力)**
    - **Concept:** Prove that "Deadlines are the mother of invention."
    - **Logic:** Detect abnormal spikes in daily release counts and correlate them with known contest deadlines (e.g., Heroes League).
    - **Insight:** Visualizes the "Summer Homework" phenomenon in adult prototyping.
    - **Fun Factor:** ⭐⭐⭐⭐ (Humorous and relatable truth)
    - **Difficulty:** Medium-High (Requires manual mapping of contest dates or anomaly detection)

- **The Prototyping Chronicle (年代記)**
    - **Concept:** Record the "Zeitgeist" of each era.
    - **Logic:**
        - Identify the "First Penguin" (First release of the year) and "Grand Finale" (Last release) for each year.
        - Identify milestone prototypes (e.g., 1000th, 2000th release).
    - **Insight:** Adds historical significance to individual works.
    - **Fun Factor:** ⭐⭐⭐ (Honors individual creators)
    - **Difficulty:** Low (Simple sorting and indexing)

#### 2. Tag & Material Focused Analysis (タグ・構成要素に着目)

- **Tech Stack Trends (技術トレンドの旬マップ)**
    - **Concept:** Visualize the rise and fall of technologies over time.
    - **Logic:** Cross-reference `materials` tags with `releaseDate`. Plot the usage count of specific technologies (e.g., M5Stack, ChatGPT) over years/months.
    - **Insight:** Shows the history of "What was hot when."
    - **Fun Factor:** ⭐⭐⭐⭐⭐ (Highly relevant for tech enthusiasts)
    - **Difficulty:** Medium-High (Requires time-series aggregation per tag)

- **Tech Stack Combinations (テック・スタック共起分析)**
    - **Concept:** Discover "Winning Combinations."
    - **Logic:** Analyze which `materials` are frequently used together (e.g., M5Stack + Unity).
    - **Insight:** Provides technical inspiration and reveals "Ironclad" configs.
    - **Fun Factor:** ⭐⭐⭐⭐ (Practical value for builders)
    - **Difficulty:** Medium-High (Matrix calculation)

#### 3. Engagement & Community Analysis (エンゲージメント・コミュニティに着目)

- **Engagement Heatmap (作品の温度感ヒートマップ)**
    - **Concept:** Visualize the distribution of engagement.
    - **Logic:** Scatter plot with X-axis = View Count, Y-axis = Good Rate (Good/View).
    - **Insight:** Discover "Hidden Gems" (Low View, High Good Rate) vs "Viral Hits".
    - **Fun Factor:** ⭐⭐⭐⭐ (Visual exploration of the ecosystem)
    - **Difficulty:** High (Frontend visualization complexity)

---

### Implementation Phases (Draft)

1. **Phase 1: Basic Temporal Analysis**
    - Implement `Maker's Rhythm` (Day/Month distribution).
    - Implement `The Holy Day`.
    - Visualize existing `Year Distribution`.

2. **Phase 2: Advanced Time Calculation**
    - Implement `Incubation Period` (Create vs Release diff).
    - Implement `The Eternal Flame` (Streak calculation).
    - Implement `The Prototyping Chronicle`.

3. **Phase 3: Trends & Relations**
    - Implement `Tech Stack Trends`.
    - Implement `Tech Stack Combinations`.
    - (Optional) `Engagement Heatmap`.
