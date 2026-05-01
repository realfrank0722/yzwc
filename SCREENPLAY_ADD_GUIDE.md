# 新增剧本实施说明（甄嬛传 / 走向共和）

本文用于指导你在当前项目里新增一个独立剧本（题库 + 人物介绍 + 头像资源 + 运行时加载）。

## 1. 当前解耦现状（先说结论）

目前是**“数据层已基本解耦，页面入口层未完全解耦”**：

- 已解耦（做得不错）
  - `src/scripts/registry.js`：有剧本注册中心（key -> manifest loader）
  - `src/scripts/loader.js`：统一 runtime 加载流程（`manifest -> dataset -> window.questions/characterMap` 兼容注入）
  - `src/data/screenplays/<key>/`：每个剧本独立目录，`manifest / dataset / questions / characters` 分层清晰
  - `assetsBase + asset-resolver`：资源路径可按剧本前缀统一解析

- 未完全解耦（当前新增剧本会卡住的点）
  - `src/scripts/registry.js` 只注册了 `yongzheng`
  - `src/app/bootstrap.js` 启动时固定 `loadScreenplayRuntime("yongzheng")`
  - `src/app/main.js` 的 `startQuizFromScreenplay()` 里硬编码：
    - 非 `yongzheng` 直接提示“即将上线”，不进入答题
  - 首页弹窗剧本卡片目前是静态 HTML，不是由注册中心动态渲染

## 2. 新增一个剧本的标准步骤

下面以 `zhenhuan`（甄嬛传）为例，`gonghe`（走向共和）同理。

### 步骤 A：创建数据目录与文件

新增目录：

- `src/data/screenplays/zhenhuan/`

至少包含 4 个文件：

1. `manifest.js`
2. `dataset.js`
3. `questions.js`
4. `characters.js`

建议直接对照 `src/data/screenplays/yongzheng/` 复制一份再改内容。

---

### 步骤 B：填写 manifest（剧本元信息 + 数据入口）

`manifest.js` 需包含：

- `key`（如 `zhenhuan`）
- `meta`（标题、副标题、描述）
- `theme`（可先占位）
- `poster`（作者/社交/cta，可沿用）
- `assetsBase`（例如 `assets/screenplays/zhenhuan`）
- `loadDataset()`（动态 import `./dataset.js` 并返回 `{ questions, characterMap }`）

---

### 步骤 C：填充题库（questions）

`questions.js` 格式必须与现有一致：

- 数组项结构：
  - `id`
  - `question`
  - `options[]`
    - `key`
    - `text`
    - `scoreChanges`（长度必须和评分维度一致）

注意：

- `scoreChanges` 维度顺序保持当前约定：
  - `[人味, 做事, 权谋, 心态, 野心]`
- 题目数量建议先与现有一致（40）以降低回归风险

---

### 步骤 D：填充人物图谱（characters）

`characters.js` 的 `characterMap` 每个角色建议包含：

- `key / name / title / quote / traits / desc`
- `avatar`（fallback 字）
- `avatarUrl`（相对资源路径）
- `nameColor / themeColor`
- `stats`（5 维雷达图）

注意：

- 至少保证有一个可作为 fallback 的角色（当前逻辑里存在 fallback key 使用）
- `avatarUrl` 路径应能通过 `assetsBase` 解析正确

---

### 步骤 E：放置静态资源

新增资源目录：

- `assets/screenplays/zhenhuan/avatars/`

把对应头像文件放进去，并确保 `characters.js` 里 `avatarUrl` 与文件名一致。

---

### 步骤 F：注册剧本到注册中心

修改 `src/scripts/registry.js`：

- 在 `screenplayRegistry` 增加：
  - `"zhenhuan" -> () => import("../data/screenplays/zhenhuan/manifest.js")`

这是“被系统识别”的第一步。

---

### 步骤 G：解除业务层硬编码（关键）

修改 `src/app/main.js` 的 `startQuizFromScreenplay(screenplayKey)`：

- 删除“非 `yongzheng` 直接拦截”的逻辑
- 改成：
  1. 调用 `loadScreenplayRuntime(screenplayKey)`（需从 loader 引入）
  2. 成功后用新数据重置 quiz state
  3. 再进入 quiz 页面

如果保守一点，也可以先做：

- 支持 `yongzheng | zhenhuan | gonghe` 的白名单，而不是完全放开

---

### 步骤 H：首页剧本卡片与 key 对齐

确保弹窗里每个“开始测试”按钮：

- `data-screenplay="zhenhuan"` / `data-screenplay="gonghe"`

与 registry 的 key 完全一致（大小写也一致）。

---

### 步骤 I：验证清单

每加一个剧本至少检查：

1. 首页点击“开始测试”是否成功进入题目页
2. 进度条、上一题/下一题是否正常
3. 结果页是否能匹配到角色并显示头像、雷达图
4. 海报导出是否不报错
5. 控制台无 `未注册的剧本` / `题库为空` / 头像 404

## 3. 推荐的下一步改造（让后续扩展更省事）

建议按以下顺序做小重构：

1. **把首页剧本卡片改成动态渲染**
   - 数据来自 `listRegisteredScreenplays()` + 每个 manifest 的 `meta`
   - 避免每加剧本都手改 HTML

2. **把 runtime 切换封装成统一函数**
   - 如 `switchScreenplay(key)`，内部做加载、状态重置、UI 刷新

3. **增加剧本 schema 校验**
   - 在加载时校验 questions/characters 关键字段
   - 提前暴露数据问题，避免运行时才发现

## 4. 一句话总结

你现在的底层“剧本模块化”基础已经够用了；要顺利扩展到甄嬛传/走向共和，重点就是：

- 注册新剧本（registry）
- 补齐数据与资源（data/assets）
- 去掉业务入口对 `yongzheng` 的硬编码拦截（main）

做完这三步，就能稳定进入“多剧本可持续扩展”状态。

---

## 5. 继续解耦路线图（支持“每个剧本维度不同”）

你提到后续每个剧本的“五维”都可能不一样，这一条很关键。  
如果继续解耦，建议按 **6 步**做，避免一次性大改导致不稳定。

### 第 1 步：把“维度定义”从全局常量迁到剧本 manifest

当前是全局默认五维。建议改为每个剧本自带维度配置，例如在 `manifest.js` 增加：

- `dimensions`: `[{ key, label, shortLabel, color? }, ...]`

示例（概念）：

- 雍正：`人味/做事/权谋/心态/野心`
- 甄嬛：`情感/洞察/心计/韧性/胆识`
- 走向共和：`理想/权术/改革/隐忍/格局`

这样后续评分、图表、文案都不再依赖固定五维语义。

---

### 第 2 步：让题目与人物 stats 跟随维度长度

把校验规则改为“动态长度”而不是固定 5：

- `questions[].options[].scoreChanges.length === manifest.dimensions.length`
- `characterMap[role].stats.length === manifest.dimensions.length`
- `BASE_SCORES.length === manifest.dimensions.length`

建议做一个统一校验函数（例如 `validateScreenplayDataset(manifest, dataset)`），在 `loadScreenplayRuntime()` 里调用，加载时即报错。

---

### 第 3 步：把评分引擎从固定数组升级为“维度驱动”

现有 `score-calculator` 逻辑大概率已是数组加减，改造成本不高：

- 初始化分数：根据 `dimensions.length` 动态创建
- 所有加减循环：按数组长度迭代，不写死索引
- 空值/越界防御：发现维度不匹配直接 throw，避免 silent bug

---

### 第 4 步：让雷达图与结果文案读取剧本维度标签

结果页图表标签不要再写死：

- `labels = manifest.dimensions.map(d => d.label)`

结果页如有“五维说明文案”，建议也改成按 `dimensions` 动态渲染；否则新增剧本时会出现“图表对了，文案还是旧维度名”的错位。

---

### 第 5 步：把首页剧本卡片改为“注册中心驱动”

这样以后加剧本不再手改 `index.html`：

- 从 `registry + manifest.meta` 动态生成弹窗剧本列表
- `data-screenplay` 自动绑定 `manifest.key`
- 卡片里的副标题/难度/测试人数可从 manifest 扩展字段读取

这一步是“新增剧本工作量下降最多”的优化。

---

### 第 6 步：建立剧本模板与验收清单（工程化）

新增一个 `screenplay-template/`（或脚本）作为脚手架，自动生成：

- `manifest.js / dataset.js / questions.js / characters.js`
- 基础目录 `assets/screenplays/<key>/avatars/`

并固定 CI/本地检查项：

1. 维度长度一致性校验
2. 角色必填字段校验
3. 头像资源存在性校验
4. 题目数下限校验（例如 >= 20）

## 6. 继续解耦需要几步（简版结论）

### 最小可用（2 步）

1. 把维度放进 `manifest.dimensions`
2. 让评分/图表按 `dimensions.length` 动态运行

适合先跑通“不同剧本不同维度”。

### 稳定可扩展（4 步）

在上面基础上，再加：

3. 加载时做 dataset schema 校验
4. 首页剧本列表改为 registry 动态渲染

适合进入长期维护阶段。

### 工程化长期方案（6 步）

完整做完第 1~6 步（含模板和校验），后续新增剧本会从“改代码”变成“填数据”。

---

## 7. 补充：海报改为“静态 JPG 直出下载”（不再前端渲染快照）

你后续准备自己做海报图，这个方向很好，能显著降低前端复杂度与出错率。  
建议把当前“canvas 生成海报”改成“按剧本/角色映射静态 JPG”。

### 7.1 目标行为

- 用户点击“生成海报”
- 不再做 DOM 截图 / Canvas 绘制
- 直接下载你预先放在 `assets` 的 JPG 文件

### 7.2 资源组织建议

建议目录：

- `assets/screenplays/<key>/posters/<roleKey>.jpg`

例如：

- `assets/screenplays/yongzheng/posters/yongzheng.jpg`
- `assets/screenplays/zhenhuan/posters/huanhuan.jpg`
- `assets/screenplays/gonghe/posters/lizhongtang.jpg`

### 7.3 manifest 增加海报配置

在每个剧本 `manifest.js` 增加：

- `poster.mode: "static-image"`
- `poster.basePath: "assets/screenplays/<key>/posters"`
- `poster.ext: ".jpg"`

可选再加：

- `poster.fallback: "default.jpg"`（当角色图缺失时兜底）

### 7.4 运行时下载逻辑改造（建议）

把当前 `main.js` 中“生成海报”逻辑拆成两支：

1. 如果 `poster.mode === "static-image"`：
   - 根据 `currentRole.key` 拼路径
   - 直接触发 `<a download>` 下载
2. 否则才走旧的 canvas（过渡期可保留）

这样你可以平滑迁移，不会一次改崩。

### 7.5 这条策略对解耦的价值

- 海报模块从“渲染逻辑”变成“资源映射”
- 新增剧本时只需补图片，不再碰复杂绘图代码
- 不同剧本可有完全不同视觉风格，不受统一模板限制

## 8. 重新整理后的解耦步骤（含“维度可变 + 静态海报”）

如果把“每剧本维度不同”和“海报静态下载”一起纳入，推荐按 **7 步**执行：

1. `manifest.dimensions`：每剧本自定义维度定义  
2. questions/stats 校验：长度跟随 `dimensions.length`  
3. 评分引擎改为维度驱动（不写死 5 维）  
4. 雷达图/结果文案读取 `manifest.dimensions` 标签  
5. 海报改为 `poster.mode = static-image` + 资源映射下载  
6. 首页剧本卡片改为 registry 动态渲染  
7. 增加模板脚手架 + schema 校验（工程化）

### 简版决策

- **最快上线（3 步）**：1 + 3 + 5  
- **稳定扩展（5 步）**：1~5  
- **长期省心（7 步）**：1~7 全做

---

## 9. 当前解耦进度（截至本次改造）

下面按“第 8 节的 7 步路线”标注当前状态：

1. `manifest.dimensions`（每剧本维度定义）  
   - **已完成（基础版）**：`yongzheng/manifest.js` 已加入 `dimensions`

2. questions/stats 长度校验  
   - **已完成**：`loader.js` 已加入 `validateDatasetShape`，加载时即校验题目和角色维度长度

3. 评分引擎维度驱动  
   - **已完成**：`score-calculator.js` 支持根据维度构建基准分；答题与重开逻辑不再依赖写死 5 维

4. 雷达图读取剧本维度标签  
   - **已完成**：`result-view.js` 的雷达图标签支持 `dimensions` 动态输入

5. 海报改为静态资源下载  
   - **已完成（并已清理旧链路）**：`main.js` 只走 `poster.mode = static-image` 下载；旧 canvas 渲染模块已删除

6. 首页剧本卡片改为 registry 动态渲染  
   - **未完成**：当前卡片仍是 `index.html` 静态结构

7. 模板脚手架 + 自动化校验（工程化）  
   - **未完成**：目前仅有运行时校验，尚未有脚手架和 CI/命令校验

### 一句话结论

你现在已经到“**稳定扩展（5 步）里的第 5 步基本落地**”，剩余重点是：

- 剧本卡片动态化（第 6 步）
- 模板/校验工程化（第 7 步）

---

## 10. 解耦后的预计目录树（建议形态）+ 职责说明

> 说明：以下是“你当前结构 + 后续建议补齐项”的目标树。  
> 标记 `（现有）` 表示已经存在；`（建议新增）` 表示建议后续补齐。

```text
yzwc/
├─ index.html                                 （现有）页面骨架：多 screen 容器、静态入口
├─ SCREENPLAY_ADD_GUIDE.md                    （现有）新增剧本与解耦操作说明
├─ assets/                                    （现有）静态资源根目录
│  ├─ shared/                                 （现有）跨剧本共用资源（如首页背景）
│  └─ screenplays/                            （现有）按剧本分资源
│     └─ <key>/                               （现有/建议延续）单剧本资源目录
│        ├─ avatars/                          （现有）角色头像
│        └─ posters/                          （现有/建议）静态海报文件（<roleKey>.<ext>）
└─ src/                                       （现有）业务源码根目录
   ├─ app/                                    （现有）流程编排与运行时状态
   │  ├─ main.js                              （现有）主交互控制器（页面流转/事件绑定）
   │  ├─ bootstrap.js                         （现有）启动入口（加载默认剧本并引导）
   │  ├─ runtime/
   │  │  ├─ store.js                          （现有）全局剧本/流程状态存储
   │  │  └─ engine.js                         （现有）流程状态枚举
   │  └─ usecases/                            （现有）业务动作（start/answer/submit/restart）
   ├─ data/                                   （现有）纯数据层（按剧本隔离）
   │  └─ screenplays/
   │     └─ <key>/
   │        ├─ manifest.js                    （现有）剧本元信息、维度定义、海报策略、dataset 入口
   │        ├─ dataset.js                     （现有）questions + characterMap 聚合导出
   │        ├─ questions.js                   （现有）题库数据（含 scoreChanges）
   │        └─ characters.js                  （现有）角色图谱（含 stats / avatarUrl）
   ├─ domain/                                 （现有）领域算法（不关心页面）
   │  ├─ scoring/score-calculator.js          （现有）维度分计算、base score 构建
   │  └─ matching/character-matcher.js        （现有）按分数匹配角色
   ├─ scripts/                                （现有）剧本装配与资源解析
   │  ├─ registry.js                          （现有）剧本注册中心（key -> manifest loader）
   │  ├─ loader.js                            （现有）manifest + dataset 加载与校验、注入 runtime
   │  └─ asset-resolver.js                    （现有）静态资源路径拼接规则
   ├─ ui/                                     （现有）页面视图渲染
   │  └─ pages/
   │     ├─ quiz/quiz-view.js                 （现有）答题页渲染
   │     ├─ result/result-view.js             （现有）结果页渲染（含雷达图）
   │     └─ home/home-view.js                 （现有）首页局部交互渲染
   ├─ styles/style.css                        （现有）全局样式与页面样式
   └─ tools/                                  （现有）项目辅助脚本目录
```

### 目录职责（文件夹层级）

- `assets/`
  - 只放静态文件，不放逻辑。目标是“换资源不改代码”。
- `src/data/screenplays/`
  - 每个剧本是一个独立数据包，彼此隔离，方便并行制作与回滚。
- `src/domain/`
  - 纯算法层，只处理“怎么算”，不处理“怎么展示”。
- `src/scripts/`
  - 装配层，把“数据 + 资源 + 运行时”接起来，是解耦的关键粘合层。
- `src/app/`
  - 编排层，负责用户流程和状态推进。
- `src/ui/`
  - 视图层，负责把数据渲染成页面。

### 文件职责（关键文件）

- `manifest.js`
  - 剧本配置中枢：标题、主题、维度、海报模式、资源根路径。
  - 未来新增字段都优先放这里，避免散落在多个模块。

- `questions.js`
  - 题目数据源。每个选项的 `scoreChanges` 必须与 `dimensions` 长度一致。

- `characters.js`
  - 角色画像源。`stats` 与 `dimensions` 一一对应，`avatarUrl` 对应 assets 资源。

- `registry.js`
  - 系统“可识别剧本列表”。不注册 = 系统不可加载。

- `loader.js`
  - 统一加载入口 + 校验入口。新增剧本能否稳定运行，先看这里是否通过。

- `main.js`
  - 业务编排总线。当前已支持动态加载剧本和静态海报下载。
  - 后续要做卡片动态化，也会主要改这里（或拆出 screenplay-list 模块）。

---

## 11. 下一阶段建议（从“已解耦”到“高效生产”）

按优先级建议你下一步做：

1. 完成第 6 步：弹窗剧本卡片动态化（减少手改 HTML）  
2. 完成第 7 步：新增剧本模板脚手架（降低重复劳动）  
3. 增加“资源存在性检查脚本”（头像/海报缺失提前报错）

这样后续你加甄嬛传、走向共和，基本会变成“填数据 + 放资源”的流水线动作。

