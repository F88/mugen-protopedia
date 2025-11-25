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
    - **Concept:** Visualize the life cycle of makers through their release patterns.
    - **Logic:** Aggregate release counts by "Day of Week" and "Month". Also calculate average `goodCount` or `viewCount` per day of the week.
    - **Insight:** Are there more "Weekend Hackers" (Sat/Sun) or "Weekday Warriors"? Is there a seasonal trend? Also, **"Strategic Insight"**: Which day of the week yields the highest engagement (e.g., "The Monday Blues" vs "Friday Release")?
    - **Fun Factor:** ⭐⭐⭐ (Relatable "lifestyle" and strategic data)
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

*   **Labor of Love (難産 / 熟成期間)**
    *   **Concept:** Visualize the prolonged effort and dedication behind a prototype. This analysis celebrates the "struggle" and persistence of creators by focusing on the length of time a prototype spent "in the making" from its initial registration to its public release.
    *   **Logic:** Calculate the duration between `createDate` (when the prototype was first registered in the system) and `releaseDate` (when it was publicly released).
        *   **Focus on Length:** Exclude cases where `createDate` and `releaseDate` are the same (as this might simply reflect administrative timing rather than actual rapid development). Focus instead on works with significant gestation periods.
        *   **Analysis:**
            *   **Longest Gestation Ranking:** Top N prototypes with the longest duration between creation and release.
            *   **Distribution:** Display the distribution of gestation periods across all prototypes (e.g., histogram showing how many prototypes took 1 month, 3 months, 1 year, etc.).
    *   **Insight:** Honors the perseverance of makers. A long gestation period might indicate deep technical challenges, a meticulous development process, or a creator's unwavering commitment to an idea over time. This offers a different narrative from "speed of creation."
    *   **Fun Factor:** ⭐⭐⭐⭐⭐ (Highlights compelling backstories and dedication)
    *   **Difficulty:** Medium (Requires careful timestamp handling and filtering for meaningful durations)

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
        -   **Difficulty:** Low (Simple sorting and indexing)
    
    - **The Weekend Warrior's Crunch (週末の修羅場 / Last Minute Hero)**
        - **Concept:** Visualize the climax of weekend development, highlighting the passion (or lack of planning) of makers.
        - **Logic:**
            - **The Sunday Night Sprint:** Aggregate releases from Sunday 20:00 to Monday 05:00.
            - **Midnight vs Daywalker:** Compare "Midnight" releases (23:00-04:00) vs "Daytime" releases (09:00-18:00).
        - **Insight:** Reveals the "Crunch Time" reality of hobbyist makers. Are they burning the midnight oil before the work week starts?
        - **Fun Factor:** ⭐⭐⭐⭐⭐ (High relatability for engineers)
        - **Difficulty:** Low (Hour extraction and aggregation)
    
    - **The Anniversary Effect (アニバーサリー効果)**
        - **Concept:** Reveal the intent behind choosing specific release dates like holidays or anniversaries.
        - **Logic:** Match `releaseDate` against a predefined list of holidays (manual update) and fixed commemorative days (Xmas, Valentine's, April Fool's).
        - **Insight:** Discover playful or strategic releases. (e.g., Joke gadgets on April 1st, Romantic tech on Feb 14th).
        - **Constraint:** Requires annual manual update of holiday data (Japanese holidays).
    
    - **Lunar Cycle Coding (月齢と開発)**
        - **Concept:** A playful analysis correlating development cycles with lunar phases.
        - **Logic:** Calculate the moon phase for the `releaseDate` (using a simple approximation formula). Compare release volume on Full Moons vs New Moons.
        - **Insight:** Pure entertainment value. Validates (or debunks) urban legends about "Full Moon Bugs."
            - **Fun Factor:** ⭐⭐⭐⭐⭐ (Occult-meet-Tech)
            -   **Difficulty:** Medium (Requires moon phase calculation logic)
        
        - **The Star Alignment (星の巡り合わせ)**
            - **Concept:** Celebrate the synchronicity of creation.
            - **Logic:** Find "Twin Prototypes" released at the exact same date and time. Or identify "Miracle Days" with an unusually high number of unrelated releases.
            - **Insight:** Highlights the serendipity of the community. Two creators, miles apart, pressing "Release" at the same moment.
            - **Fun Factor:** ⭐⭐⭐⭐ (Romantic and mysterious)
            - **Difficulty:** Low (Exact timestamp matching)
        
        - **The Early Adopter (時代の先駆者 / 技術の始祖)**
            - **Concept:** Identify the "Firstborn" of specific technologies or trends.
            - **Logic:** For major tags (e.g., "M5Stack", "ChatGPT"), identify the prototype with the earliest `releaseDate`.
            - **Insight:** Honors the pioneers who first brought a technology into the ProtoPedia ecosystem. Answers "Who used ChatGPT first?"
            - **Fun Factor:** ⭐⭐⭐⭐⭐ (Historical value)
                    *   **Difficulty:** Medium (Requires aggregating min-date per tag)
            
            #### 3. Sensory & Physical Analysis (感覚と物理性に着目)
            
            *   **The Color of Innovation (イノベーションの色)
                *   **Concept:** Analyze the visual trends of prototypes through color-related keywords.
                *   **Logic:** Extract color names (e.g., "Red", "Blue", "Transparent", "Black") from tags. Analyze correlations between specific technologies (e.g., "M5Stack" is often "White" or "Black") and year-over-year color trends.
                *   **Insight:** Visualizes the "aesthetic" trends of the community.
                *   **Fun Factor:** ⭐⭐⭐ (Visual curiosity)
                *   **Difficulty:** Low (Keyword extraction)
            
            *   **The Sound of Code (コードの音)
                *   **Concept:** Focus on prototypes that appeal to the auditory sense.
                *   **Logic:** Filter prototypes with tags or descriptions related to sound (e.g., "Music", "Synth", "Voice", "Speak"). Compare the ratio of "Visual" vs "Auditory" projects.
                *   **Insight:** Highlights the diversity of output modalities in prototyping.
                *   **Fun Factor:** ⭐⭐⭐ (Sensory exploration)
                *   **Difficulty:** Low (Keyword extraction)
            
            *   **The Tangible Interface (触れるインターフェース)
                *   **Concept:** Focus on prototypes with physical interactivity.
                *   **Logic:** Look for tags indicating physical controls (e.g., "Button", "Switch", "Sensor", "Haptic"). Calculate the "Touchy-Feely Index" (ratio of physical interaction tags).
                *   **Insight:** Highlights the "Hardware" nature of the community, distinguishing it from pure software/web projects.
                *   **Fun Factor:** ⭐⭐⭐⭐ (Appeals to hardware enthusiasts)
                *   **Difficulty:** Low (Keyword extraction)
            
            #### 4. Tag & Material Focused Analysis (タグ・構成要素に着目)
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

- **The Title Smith (ネーミングの流行)**
    -   **Concept:** Analyze trends and styles in prototype naming conventions over time.
    -   **Logic:** Examine `prototypeNm` (prototype name) for length distribution, common keywords, and popular suffixes (e.g., "-bot", "-chan", "-system", "-2.0").
    -   **Insight:** Reveals cultural and linguistic trends within the community, distinct from purely technical trends.
        - **Fun Factor:** ⭐⭐⭐ (Cultural insight)
        -   **Difficulty:** Medium (Requires text processing/tokenization)
    
    - **The "Tag" Purist vs Anarchist (タグの純粋主義者 vs 無政府主義者)**
        -   **Concept:** Analyze the tagging style of creators.
        -   **Logic:** Calculate the ratio of "Standard Tags" (top 100 most common tags) vs "Unique/Rare Tags" for each prototype.
        -   **Insight:** Distinguishes between creators who follow standard categorizations ("Purists") and those who use tags for free expression, poetry, or unique categorization ("Anarchists").
        -   **Fun Factor:** ⭐⭐⭐⭐ (Personality profiling)
        -   **Difficulty:** Medium (Requires global tag frequency analysis)
    
    #### 3. Engagement & Community Analysis (エンゲージメント・コミュニティに着目)

*   **Living Projects (生き続ける作品 / 育成期間)**
    *   **Concept:** Visualize prototypes that continue to be maintained and loved even after their initial release. This analysis highlights projects that are "cared for" rather than abandoned after launch.
    *   **Logic:** Calculate the duration between `updateDate` (latest update) and `releaseDate` (initial release). Longer durations indicate ongoing commitment.
    *   **Insight:** Identifies projects with sustained developer interest. It helps to differentiate "set-and-forget" projects from those that are actively nurtured over time.
    *   **Limitations:** The API only provides the *latest* update date, so it cannot reveal the *frequency* or *history* of updates, only the total span of maintenance.
    *   **Fun Factor:** ⭐⭐⭐⭐ (Celebrates long-term dedication and perseverance)
    *   **Difficulty:** Low (Simple date calculation)

*   **The Official Leap (公式への飛躍)**
    *   **Concept:** Identify prototypes that have moved beyond the "experiment" phase to become official projects, products, or services with dedicated web presence.
    *   **Logic:** Analyze the presence and characteristics of `officialLink`.
        *   **Metrics:** Percentage of prototypes with `officialLink`. Distribution of domains used (e.g., GitHub Pages, Vercel, custom domains).
    *   **Insight:** Highlights the transition from prototyping to productization.
    *   **Caveat:** A lack of `officialLink` does not imply less quality, especially for hardware or physical computing projects that might not require a web presence.
    *   **Fun Factor:** ⭐⭐⭐ (Celebrates project maturity)
    *   **Difficulty:** Medium (Requires URL parsing/categorization)

*   **Engagement Heatmap (作品の温度感ヒートマップ)**
    *   **Concept:** Visualize the distribution of engagement.
    *   **Logic:** Scatter plot with X-axis = View Count, Y-axis = Good Rate (Good/View).
    *   **Insight:** Discover "Hidden Gems" (Low View, High Good Rate) vs "Viral Hits".
        - **Fun Factor:** ⭐⭐⭐⭐ (Visual exploration of the ecosystem)
        -   **Difficulty:** High (Frontend visualization complexity)
    
    *   **The "Silent" Masterpiece (沈黙の傑作)**
        *   **Concept:** Identify prototypes that garner high engagement despite having minimal textual description.
        *   **Logic:** Calculate "Engagement per Character" (e.g., `goodCount` / length of `summary` + `description`). Filter for prototypes with very short descriptions but high Good counts.
        *   **Insight:** Highlights works with overwhelming visual impact or intuitive concepts that "speak for themselves."
        *   **Fun Factor:** ⭐⭐⭐⭐ (Discovering impactful works)
        *   **Difficulty:** Low (Simple arithmetic)
    
    *   **The "Remix" Culture (リミックス・カルチャー)**
        *   **Concept:** Identify prototypes that reference past works, indicating a culture of self-improvement or series creation.
        *   **Logic:** Analyze `relatedLink` fields for URLs containing `protopedia.net/prototype/`.
        *   **Insight:** Visualizes connections between works, showing how creators build upon their previous efforts or reference others.
    - **Fun Factor:** ⭐⭐⭐⭐ (Visualizing the genealogy of ideas)
    -   **Difficulty:** Medium (URL parsing and graph building)

*   **The Maternity Hospital (産院 / ゆりかご)**
    *   **Concept:** Visualize where prototypes are born.
    *   **Logic:** Rank events (contests/hackathons) by the number of prototypes they produced (`events` tag). Also calculate the ratio of "Independent Births" (no event tag).
    *   **Insight:** Highlights the role of events as "Incubators" for the community. Which hackathon is the most prolific "Maternity Hospital"?
    *   **Fun Factor:** ⭐⭐⭐⭐ (Community dynamics)
    *   **Difficulty:** Low (Tag aggregation)

#### 4. Status-Focused Analysis (作品の状態に着目)

*   **The Final Destination (終焉の地 / 供養作品分析)**
    *   **Concept:** Analyze the lifecycle and characteristics of prototypes marked as "Kuyo" (memorial/discontinued).
    *   **Logic:** Filter prototypes with `status: 4`.
        *   **Assumption:** Treat `updateDate` as the approximate date the prototype entered the "Kuyo" state.
        *   **Analysis:** Calculate "Life Span" (`updateDate` - `createDate`). Analyze seasonal trends in "Kuyo" dates (e.g., end-of-year cleanup).
    *   **Insight:** Honors the end of a prototype's journey. Reveals when and why creators decide to lay their projects to rest.
    *   **Fun Factor:** ⭐⭐⭐⭐⭐ (Emotional & Cultural unique to Japanese maker culture)
    *   **Difficulty:** Low (Filtering and date diff)

*   **The Spark of Creation (創造の火花 / アイデアの種)**
    *   **Concept:** Discover prototypes that are still in the pure "Idea" phase.
    *   **Logic:** Filter prototypes with `status: 1`.
    *   **Insight:** Visualizes the "seeds" of the community. What kind of wild ideas are being registered before they are even built?
    *   **Fun Factor:** ⭐⭐⭐ (Future-oriented)
    *   **Difficulty:** Low (Simple filtering)

*   **The Eternal Beta (終わらない開発 / 永遠のベータ版)**
    *   **Concept:** Identify prototypes that remain in "Development" (`status: 2`) for a long period.
    *   **Logic:** Filter prototypes with `status: 2` and an old `releaseDate` (or `createDate`). Compare with `updateDate`.
    *   **Insight:** Distinguishes between "abandoned" projects and "persistently updated" beta projects.
    *   **Fun Factor:** ⭐⭐⭐⭐ (Persistence)
    *   **Difficulty:** Low (Filtering and date diff)

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

5. **Phase 3: Trends & Relations**
    - Implement `Tech Stack Trends`.
    - Implement `Tech Stack Combinations`.
    - (Optional) `Engagement Heatmap`.

---

### Low Priority / Out of Scope

1.  **Comment Volume Analysis (コメント数分析)**
    *   **Reason:**
        *   データ全体の傾向として、コメント件数はさほど多くない。
        *   コメントは作品への評価の一形態であり、コメント数を増やすこと自体をゲーミフィケーションの対象にすべきではない（スパム的な行動を誘発する恐れがある）。
        *   「議論の質」は数だけでは測れない。

2.  **The Refined Prototype (磨き抜かれた作品)**
    *   **Reason:**
        *   サンプルデータ (`tools/sample-data/20251115-002631-prototypes-10000.json`) の `revision` フィールドを調査した結果、ほぼ全てのプロトタイプで値が `0` であり、分析に利用できる有意なデータが含まれていないため。

3.  **License Type Analysis (ライセンスの種類分析)**
    *   **Reason:**
        *   `licenseType` は ProtoPedia サイト上でのライセンス形式を指し、作品自体の具体的なOSSライセンスを表現するものではないため、作品の「共有文化」を分析する目的には適さない。

4.  **Video/Link Presence Analysis (動画・リンク有無分析)**
    *   **Reason:**
        *   `videoUrl` や `relatedLink` フィールドからは「動画・リンクの有無」しか判断できず、その内容や質まで踏み込んだ分析ができない。動画やリンクの存在自体を分析しても、作品の深い洞察には繋がりにくい。

5.  **The Social Graph (チームの流動性分析)**
    *   **Reason:**
        *   ユーザー間の関係性や活動パターンに関する分析は、個人のプライバシーやセンシティブな情報に触れる可能性があり、現時点では優先度を低く設定する。

6.  **Thanks Flag Analysis (感謝フラグ分析)**
    *   **Reason:**
        *   `thanksFlg` のデータが分析に適さない性質であるため（例えば、一律に同じ値である、または意味のあるバリエーションがない、など）。詳細な分析には追加のデータまたは背景情報が必要。

7.  **The Birth Weight (出生体重)**
    -   **Reason:**
        -   APIからは最新の `description` や `tags` しか取得できず、リリース時点（誕生時）のスナップショットデータが存在しないため、初期状態のボリュームを正確に分析することが不可能であるため。

9.  **The Global Village (地球村 / 地域分析)**
    -   **Reason:**
        -   地名に基づく分析は、意図せず開発者の居住地や活動拠点を露わにするリスクがあり、プライバシー保護の観点から実施しない。
