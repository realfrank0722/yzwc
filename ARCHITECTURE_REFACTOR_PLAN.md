# 多剧本测试平台大厅改版方案（评审稿）

> 当前阶段：需求评审 / UI&UX 方案设计  
> 约束：本文件只描述方案，不涉及代码实现细节  
> 内容边界：当前只使用《雍正王朝》角色数据，不引入《甄嬛传》《三国》等预留内容

---

## 项目架构树（带注释）

```text
yzwc-main/
├─ index.html
│  └─ 页面骨架：放三屏 DOM（首页/答题页/结果页），挂载入口脚本和样式
│
├─ src/
│  ├─ app/                                      # 应用编排层：把数据、算法、UI 串起来
│  │  ├─ bootstrap.js
│  │  │  └─ 启动入口：加载剧本运行时，再加载 main.js
│  │  ├─ main.js
│  │  │  └─ 主流程控制：绑定按钮事件、切页面、调 usecase、触发海报导出
│  │  ├─ runtime/
│  │  │  ├─ engine.js
│  │  │  │  └─ 流程状态定义与切换（SELECT_SCREENPLAY/QUIZ_RUNNING/RESULT_READY...）
│  │  │  └─ store.js
│  │  │     └─ 轻量全局状态（当前剧本、流程状态）
│  │  └─ usecases/
│  │     ├─ start-quiz.js       # 开始答题
│  │     ├─ answer-question.js  # 作答并更新分数
│  │     ├─ navigate-quiz.js    # 上一题/下一题/提交边界
│  │     ├─ submit-quiz.js      # 提交后串联算分+匹配
│  │     └─ restart-quiz.js     # 重测重置状态
│  │
│  ├─ domain/                                   # 纯业务算法层（尽量不碰 DOM）
│  │  ├─ scoring/score-calculator.js            # 五维算分算法
│  │  ├─ matching/character-matcher.js          # 角色匹配算法
│  │  └─ poster/poster-renderer.js              # Canvas 海报渲染算法
│  │
│  ├─ data/screenplays/yongzheng/               # 雍正剧本数据包
│  │  ├─ manifest.js                            # 剧本元信息+加载入口
│  │  ├─ dataset.js                             # 数据聚合导出
│  │  ├─ questions.js                           # 题库数据
│  │  └─ characters.js                          # 角色图鉴数据
│  │
│  ├─ scripts/                                  # 运行时脚本层（注册、加载、资源解析）
│  │  ├─ registry.js                            # 剧本注册表：key -> manifest loader
│  │  ├─ loader.js                              # 按 key 加载 manifest+dataset 并注入运行时
│  │  └─ asset-resolver.js                      # 资源路径解析工具
│  │
│  ├─ ui/pages/
│  │  ├─ quiz/quiz-view.js                      # 答题页渲染
│  │  └─ result/result-view.js                  # 结果页渲染
│  │
│  └─ styles/style.css                          # 全站样式
│
├─ assets/                                      # 静态资源
│  ├─ shared/                                   # 通用资源（字体/图标）
│  └─ screenplays/yongzheng/
│     ├─ avatars/                               # 角色头像
│     ├─ posters/                               # 海报相关资源
│     └─ audio/                                 # 预留音频
│
├─ tools/data-build/
│  ├─ build_questions.py                        # 离线改题目分数脚本（不参与线上运行）
│  └─ README.md                                 # 工具使用说明
│
└─ ARCHITECTURE_REFACTOR_PLAN.md                # 这份说明文档
```

---

## 一句话先说清

这是一个“性格测试引擎 + 剧本数据包”的项目。

- 引擎负责：流程、算分、匹配角色、渲染海报
- 剧本负责：题目、人设、文案、资源路径

所以后面加《甄嬛传》《三国》，原则上是“加一套数据和资源”，而不是改核心算法。

---

## 项目怎么跑（运行链路）

页面启动顺序是：

1. `index.html` 加载 `src/app/bootstrap.js`
2. `bootstrap.js` 调 `loadScreenplayRuntime("yongzheng")`
3. `loader.js` 从注册表找到雍正剧本，加载 manifest 和 dataset
4. dataset 把题库和人物图鉴给到运行时（`window.questions` / `window.characterMap`）
5. 最后加载 `src/app/main.js`，开始绑定页面事件，正式可玩

你只要记住：**启动入口在 `bootstrap.js`，业务主循环在 `main.js`**。

---

## 新同学 5 分钟上手路径

按这个顺序看，最快：

1. 先看 `index.html`，知道页面有哪些容器和按钮 id
2. 看 `src/app/bootstrap.js`，知道项目怎么启动
3. 看 `src/app/main.js`，知道整个交互流程怎么串起来
4. 看 `src/app/usecases/*.js`，知道“业务动作”怎么拆的
5. 看 `src/domain/scoring` + `src/domain/matching`，知道结果怎么算出来
6. 看 `src/data/screenplays/yongzheng/*`，知道数据从哪来

如果 5 分钟内只做一件事：**把 `main.js` 的事件流读通**，你就能定位 80% 的问题。

---

## 算法大白话

### 1) 算分算法（`src/domain/scoring/score-calculator.js`）

- 初始五维分固定为 `50,50,50,50,50`
- 每道题选项有 `scoreChanges`（5 维加减）
- 所有作答的 `scoreChanges` 累加
- 每维最终夹在 `0~100`

一句话：**每题加减分，最后做安全限幅**。

### 2) 匹配算法（`src/domain/matching/character-matcher.js`）

对每个候选角色，算三个指标：

- `distance`：加权曼哈顿距离（差距越小越像）
- `shapeSimilarity`：以 50 为中心看“轮廓像不像”
- `maxDifference`：防止某一维偏差特别离谱

排序优先级：

1. `shapeSimilarity` 高优先
2. `distance` 小优先
3. `maxDifference` 小优先
4. 最后按 key 保稳定

一句话：**先看整体气质像不像，再看具体分差**。

### 3) 海报渲染算法（`src/domain/poster/poster-renderer.js`）

- 用 Canvas 重绘，不是截图
- 处理头像加载失败兜底
- 中文断行与标点优化
- 末行平衡、两端对齐
- 输出可下载海报

一句话：**按排版规则“重新作画”结果海报**。

---

## 首页改版目标（本次评审范围）

把首页升级成“测试平台大厅”，不是单一剧本落地页。

核心目标：

1. 平台感：中性、克制、可承载多剧本
2. 沉浸感：低饱和白/灰/绿，视觉舒服
3. 可切换：大厅暗绿 -> 雍正淡紫平滑过渡
4. 可扩展：后续新增剧本主要改数据，不改核心架构

---

## 色彩与全局基调方案（重点）

### 1) 大厅主色（低饱和白/灰/绿）

- 背景：深灰绿/雾感绿
- 文本：浅灰白高可读
- 分割：半透明灰绿
- 强调：轻青绿色点缀交互态

目标：看起来像“平台”，不是“强戏剧主题页”。

### 2) 雍正剧本色（低饱和淡紫）

- 灰紫/暗紫替代旧暗红
- 用于卡片激活态、CTA、高亮描边、弱光晕

目标：有区分，但不刺眼。

### 3) 过渡策略（暗绿 -> 淡紫）

- 用 CSS 语义变量分层：
  - 基础层：`bg/text/border/surface`
  - 剧本层：`accent/cta/glow`
- 切换主题时只覆写少量语义变量
- 颜色过渡时长建议 `240~420ms`

---

## CSS 变量调色盘规划（方案级）

推荐语义变量：

- `--bg-page`
- `--bg-elevated`
- `--text-primary`
- `--text-secondary`
- `--border-subtle`
- `--accent-primary`
- `--accent-soft`
- `--focus-ring`
- `--shadow-soft`
- `--shadow-strong`

规则：

- 大厅定义基础变量
- 雍正仅覆写 accent 相关
- 覆写比例控制在 20% 以内，避免“切主题像换站点”

---

## 首页组件拆解（UI）

建议拆为 6 个主组件：

1. `TopNavbar`：左“沉浸式性格测试”，右剧本菜单按钮
2. `HeroHeader`：主副标题与高级排版
3. `SocialProof`：`20W+` / `98.5%` 等背书块
4. `CharacterCarousel`：横向角色卡轮播
5. `CarouselDots`：轮播联动点状进度
6. `FooterInfo`：作者信息与社交链接

---

## 交互逻辑设计

### 1) 右上角剧本菜单

- 点击展开，再点按钮/空白/Esc 收起
- 按钮有激活态
- 当前只有雍正，菜单显示“已选中态”
- 结构保留多剧本扩展能力

### 2) 角色轮播 + Dots

- 支持触屏滑动/鼠标拖动
- 隐藏默认滚动条但保留滚动能力
- 卡片吸附停靠（scroll snap 思路）
- 当前卡片高亮
- Dots 实时同步，点击 Dot 可跳转

---

## 数据接入考量（首页如何拿角色卡）

现有架构建议取数路径：

1. `registry.js` 选中剧本 key
2. `manifest.js` 读取剧本 meta
3. `characters.js` 抽取卡片字段：
   - `avatarUrl`
   - `name`
   - `title` 或 `quote`

注意：

- 本阶段只接入雍正数据
- 不加其他剧本假数据
- 首页只消费“展示模型”，不要直接耦合算法字段

---

## 副标题与社交证明文案（按本次需求）

- 主标题：`热门影视剧人物性格测试`
- 副标题第一行：`你是否经常带入影视剧中的角色，但又不确定自己到底是哪个人物`
- 副标题第二行：`10分钟，40道题，做完看看你在各大影视剧中可以是谁`

社交证明建议：

- `🔥 累计参与 20W+`
- `⭐ 准确率 98.5%`

---

## 新增剧本最少改 4 处（极简版）

1. 新建 `src/data/screenplays/<newKey>/manifest.js`
2. 新建 `questions.js` + `characters.js`（`dataset.js` 聚合）
3. 新建 `assets/screenplays/<newKey>/...`
4. 在 `src/scripts/registry.js` 注册 `<newKey>`

做到这 4 处，理论上不需要改核心算法层。

---

## 本阶段边界（防跑偏）

本阶段只做方案，不做代码实现。

明确不做：

- 不引入《甄嬛传》《三国》预留数据
- 不提前做复杂路由/埋点/后端策略
- 不在评审稿里展开工程实现细节

# 项目说明（大白话版）

这份文档不讲“术语正确”，只讲“你后面维护时一眼看懂”。

---

## 一句话先说清

这是一个“性格测试引擎 + 剧本数据包”的项目。

- 引擎负责：流程、算分、匹配角色、渲染海报
- 剧本负责：题目、人设、文案、资源路径

所以后面加《甄嬛传》《三国》，原则上是“加一套数据和资源”，而不是改核心算法。

---

## 项目架构树（带注释）

```text
yzwc-main/
├─ index.html
│  └─ 页面骨架：放三屏 DOM（首页/答题页/结果页），挂载入口脚本和样式
│
├─ src/
│  ├─ app/                                      # 应用编排层：把数据、算法、UI 串起来
│  │  ├─ bootstrap.js
│  │  │  └─ 启动入口：加载剧本运行时，再加载 main.js
│  │  ├─ main.js
│  │  │  └─ 主流程控制：绑定按钮事件、切页面、调 usecase、触发海报导出
│  │  ├─ runtime/
│  │  │  ├─ engine.js
│  │  │  │  └─ 流程状态定义与切换（SELECT_SCREENPLAY/QUIZ_RUNNING/RESULT_READY...）
│  │  │  └─ store.js
│  │  │     └─ 轻量全局状态（当前剧本、流程状态）
│  │  └─ usecases/
│  │     ├─ start-quiz.js       # 开始答题
│  │     ├─ answer-question.js  # 作答并更新分数
│  │     ├─ navigate-quiz.js    # 上一题/下一题/提交边界
│  │     ├─ submit-quiz.js      # 提交后串联算分+匹配
│  │     └─ restart-quiz.js     # 重测重置状态
│  │
│  ├─ domain/                                   # 纯业务算法层（尽量不碰 DOM）
│  │  ├─ scoring/score-calculator.js            # 五维算分算法
│  │  ├─ matching/character-matcher.js          # 角色匹配算法
│  │  └─ poster/poster-renderer.js              # Canvas 海报渲染算法
│  │
│  ├─ data/screenplays/yongzheng/               # 雍正剧本数据包
│  │  ├─ manifest.js                            # 剧本元信息+加载入口
│  │  ├─ dataset.js                             # 数据聚合导出
│  │  ├─ questions.js                           # 题库数据
│  │  └─ characters.js                          # 角色图鉴数据
│  │
│  ├─ scripts/                                  # 运行时脚本层（注册、加载、资源解析）
│  │  ├─ registry.js                            # 剧本注册表：key -> manifest loader
│  │  ├─ loader.js                              # 按 key 加载 manifest+dataset 并注入运行时
│  │  └─ asset-resolver.js                      # 资源路径解析工具
│  │
│  ├─ ui/pages/
│  │  ├─ quiz/quiz-view.js                      # 答题页渲染
│  │  └─ result/result-view.js                  # 结果页渲染
│  │
│  └─ styles/style.css                          # 全站样式
│
├─ assets/                                      # 静态资源
│  ├─ shared/                                   # 通用资源（字体/图标）
│  └─ screenplays/yongzheng/
│     ├─ avatars/                               # 角色头像
│     ├─ posters/                               # 海报相关资源
│     └─ audio/                                 # 预留音频
│
├─ tools/data-build/
│  ├─ build_questions.py                        # 离线改题目分数脚本（不参与线上运行）
│  └─ README.md                                 # 工具使用说明
│
└─ ARCHITECTURE_REFACTOR_PLAN.md                # 这份说明文档
```

---

## 项目怎么跑（运行链路）

页面启动顺序是：

1. `index.html` 加载 `src/app/bootstrap.js`
2. `bootstrap.js` 调 `loadScreenplayRuntime("yongzheng")`
3. `loader.js` 从注册表找到雍正剧本，加载 manifest 和 dataset
4. dataset 把题库和人物图鉴给到运行时（`window.questions` / `window.characterMap`）
5. 最后加载 `src/app/main.js`，开始绑定页面事件，正式可玩

你只要记住：**启动入口在 `bootstrap.js`，业务主循环在 `main.js`**。

---

## 新同学 5 分钟上手路径

按这个顺序看，最快：

1. 先看 `index.html`，知道页面有哪些容器和按钮 id
2. 看 `src/app/bootstrap.js`，知道项目怎么启动
3. 看 `src/app/main.js`，知道整个交互流程怎么串起来
4. 看 `src/app/usecases/*.js`，知道“业务动作”怎么拆的
5. 看 `src/domain/scoring` + `src/domain/matching`，知道结果怎么算出来
6. 看 `src/data/screenplays/yongzheng/*`，知道数据从哪来

如果 5 分钟内只做一件事：**把 `main.js` 的事件流读通**，你就能定位 80% 的问题。

---

## 算法大白话

## 1) 算分算法（`src/domain/scoring/score-calculator.js`）

- 初始五维分是固定 `50,50,50,50,50`
- 每道题选项有 `scoreChanges`（5 个维度的加减）
- 把所有作答的 `scoreChanges` 累加
- 最后每个维度做夹逼，保证在 `0~100`

核心特点：

- 简单、可解释、可调权重（改题库就能改行为）
- 不依赖 UI，纯函数，便于测试

## 2) 匹配算法（`src/domain/matching/character-matcher.js`）

对每个候选人物，算三个指标：

- `distance`：加权曼哈顿距离（维度差越小越像）
- `shapeSimilarity`：以 50 为中心做“形状相似度”（类似余弦）
- `maxDifference`：单维最大偏差（防止某一维差太离谱）

排序规则：

1. 先看 `shapeSimilarity`（越大越好）
2. 再看 `distance`（越小越好）
3. 再看 `maxDifference`（越小越好）
4. 还一样就按 key 字典序稳定排序

一句话：**先比“整体轮廓像不像”，再比“绝对数值差多少”**。

## 3) 海报算法（`src/domain/poster/poster-renderer.js`）

这个文件负责把结果页数据画到 Canvas：

- 加载头像（含失败兜底）
- 文案换行（中文标点优先断行）
- 末行长度平衡（避免最后一行太短难看）
- 两端对齐和标点优化
- 画标题、角色名、描述、作者区、按钮文案对应区域

一句话：**它不是“截图”，而是“按排版规则重画一张图”**。

---

## 目录/文件夹作用（按你现在仓库现状）

## 根目录

- `index.html`：唯一页面骨架（DOM 容器都在这里）
- `ARCHITECTURE_REFACTOR_PLAN.md`：就是这份说明文档
- `assets/`：图片等静态资源
- `src/`：现在所有运行时代码（核心）
- `tools/`：构建脚本，不参与浏览器运行

## `assets/`

- `assets/screenplays/yongzheng/avatars/`：角色头像
- `assets/screenplays/yongzheng/posters/`：海报相关资源（例如打赏图）
- `assets/screenplays/yongzheng/audio/`：预留音频
- `assets/shared/`：跨剧本通用资源（字体/图标）

## `src/`

- `src/app/`：应用层（启动、流程编排、用例）
- `src/domain/`：纯业务算法（算分、匹配、海报）
- `src/data/`：剧本数据（题库、人设、manifest）
- `src/ui/`：页面渲染层（quiz/result 的视图）
- `src/scripts/`：脚本层（注册表、装载器、资源解析）
- `src/styles/`：样式文件（已替代旧 css 目录）

## `tools/`

- `tools/data-build/`：离线构建工具（例如批量改题目分数）

---

## 关键文件逐个说明（当前 22 个核心文件）

## 启动与主流程

- `src/app/bootstrap.js`  
  启动器：先加载剧本运行时，再加载 `main.js`。

- `src/app/main.js`  
  当前主控文件：抓 DOM、绑事件、调 usecase、切页面、触发海报生成。

## 运行时状态

- `src/app/runtime/engine.js`  
  流程状态枚举与读写（如 `SELECT_SCREENPLAY`、`QUIZ_RUNNING`、`RESULT_READY`）。

- `src/app/runtime/store.js`  
  全局小仓库：当前剧本 key、meta、flowState。

## 用例层（app/usecases）

- `start-quiz.js`：开始答题时初始化状态  
- `answer-question.js`：选项点击后的得分更新与自动下一题判断  
- `navigate-quiz.js`：上一题/下一题/提交边界逻辑  
- `submit-quiz.js`：提交时串起“算分 + 匹配”  
- `restart-quiz.js`：重测时清理状态

这些文件都是“业务动作函数”，被 `main.js` 调用。

## 领域算法（domain）

- `scoring/score-calculator.js`：五维分计算  
- `matching/character-matcher.js`：最相近角色匹配  
- `poster/poster-renderer.js`：Canvas 海报渲染

## 视图层（ui/pages）

- `quiz/quiz-view.js`：题目页渲染、按钮状态、页面过渡  
- `result/result-view.js`：结果页头像/文案/雷达图渲染

## 剧本数据层（data/screenplays/yongzheng）

- `manifest.js`：雍正剧本总入口（meta/theme/poster/assetsBase/loadDataset）
- `dataset.js`：聚合导出（questions + characterMap）
- `questions.js`：题库（40 题）
- `characters.js`：人物图鉴（16 人）

## 脚本层（scripts）

- `registry.js`：剧本注册中心（key -> manifest loader）
- `loader.js`：按 key 加载 manifest 和 dataset，并注入运行时
- `asset-resolver.js`：资源路径解析函数（便于不同剧本切资源根目录）

## 样式

- `src/styles/style.css`：全站样式总文件（原 css 已迁过来）

## 工具

- `tools/data-build/build_questions.py`：批量改 `questions.js` 中 `scoreChanges`
- `tools/data-build/README.md`：工具用法说明

---

## 现在的架构原则（维护时别破坏）

1. 算法文件不要直接碰 DOM  
2. 数据文件不要写 UI 逻辑  
3. `main.js` 只做“编排”，复杂逻辑尽量放 usecase/domain  
4. 新增剧本优先加 `data + assets + registry`，不要改核心算法  

---

## 后续新增剧本，照着做就行

以新增 `zhenhuan` 为例：

1. 新建目录：`src/data/screenplays/zhenhuan/`
2. 按雍正同样结构放 `manifest.js + dataset.js + questions.js + characters.js`
3. 新建资源目录：`assets/screenplays/zhenhuan/...`
4. 在 `src/scripts/registry.js` 注册 `zhenhuan`
5. 完成

如果做完这 5 步还要改很多核心代码，说明架构被破坏了。

### 新增剧本最少改 4 处（极简版）

1. 新建 `src/data/screenplays/<newKey>/manifest.js`
2. 新建 `src/data/screenplays/<newKey>/questions.js` + `characters.js`（`dataset.js` 聚合）
3. 新建 `assets/screenplays/<newKey>/...`（avatars/posters/audio）
4. 在 `src/scripts/registry.js` 注册 `<newKey>`

做到这 4 处，理论上就能跑新剧本，不需要改算法层。

---

## 当前完成度（实话版）

- 已完成：`js/`、`css/` 旧运行时代码迁出
- 已完成：数据从全局变量写法改成模块化数据层
- 已完成：算法/视图/用例拆分
- 待优化但不影响跑：`src/app/main.js` 仍偏大，可继续拆到 bindings/components

---

## 结论

现在这个项目已经从“一个大脚本”变成了“可维护的模块化结构”。  
你后面维护重点只要抓三件事：

- 改算法去 `domain`
- 改流程去 `usecases/main`
- 加新剧本去 `data + assets + registry`

