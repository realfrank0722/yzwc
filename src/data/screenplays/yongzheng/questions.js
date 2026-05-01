export const questions = [
  {
    id: 1,
    question: "项目临近上线，一个同事为了赶进度私自改了流程，结果出了问题。你会？",
    options: [
      { key: "A", text: "先一起把事补回来，对外先别追责，内部再把话说透。", scoreChanges: [3, -1, -2, 1, -1] },
      { key: "B", text: "先补救，再把责任和流程都讲清楚，谁都别含糊。", scoreChanges: [0, 1, 1, 0, -2] },
      { key: "C", text: "立刻把责任切清楚，谁的问题谁承担，不能拖累团队。", scoreChanges: [-3, 0, 1, -1, 3] }
    ]
  },
  {
    id: 2,
    question: "关系很近的朋友想让你内推他，但你知道他并不适合这个岗位。你会？",
    options: [
      { key: "A", text: "还是会帮，情分到了这一步，我不想让他觉得你不站他。", scoreChanges: [3, 0, -2, 1, -2] },
      { key: "B", text: "帮他看更合适的位置，情分要顾，边界也要顾。", scoreChanges: [0, 1, 1, -1, -1] },
      { key: "C", text: "直接拒绝，这种背书一旦出了事，情分和规则都会坏掉。", scoreChanges: [-3, -1, 1, 0, 3] }
    ]
  },
  {
    id: 3,
    question: "部门预算被砍，只能保一部分人。你更可能怎么做？",
    options: [
      { key: "A", text: "优先保那些跟着你扛过事的人，至少不让自己寒人心。", scoreChanges: [2, 0, -2, 2, -2] },
      { key: "B", text: "尽量谈条件，保住最关键的人，别把局一下子做死。", scoreChanges: [0, 1, 1, -1, -1] },
      { key: "C", text: "先保住自己和核心结果，位置没了就什么都护不住。", scoreChanges: [-2, -1, 1, -1, 3] }
    ]
  },
  {
    id: 4,
    question: "一个曾经和你关系很近的同事跳去了竞对公司，私下向你打听情况。你会？",
    options: [
      { key: "A", text: "不说敏感内容，但能提醒的地方还是会提醒，旧情还在。", scoreChanges: [3, -1, -2, 1, -1] },
      { key: "B", text: "只讲原则不讲细节，既不翻脸，也不越线。", scoreChanges: [0, 1, 1, 0, -2] },
      { key: "C", text: "彻底划清界限，关系归关系，立场归立场。", scoreChanges: [-3, 0, 1, -1, 3] }
    ]
  },
  {
    id: 5,
    question: "一个关键项目没人真正盯得住，所有人都在等别人先动。你会？",
    options: [
      { key: "A", text: "先接过来推进，边干边压节奏，别让事情烂在那。", scoreChanges: [-2, 3, 0, 0, -1] },
      { key: "B", text: "先把人和资源盘清楚，再按节奏推进，不做无效硬扛。", scoreChanges: [1, 0, 1, 2, -2] },
      { key: "C", text: "先判断值不值得自己背这个锅，不值得就别白耗。", scoreChanges: [1, -3, -1, -2, 3] }
    ]
  },
  {
    id: 6,
    question: "方向还不够清晰，但老板只给了一句“你先往前推”。你会？",
    options: [
      { key: "A", text: "先定节点和交付物，边走边校准，总比空转强。", scoreChanges: [-1, 3, 0, -1, -1] },
      { key: "B", text: "先找几个关键判断点，不盲冲，但也不让事情停住。", scoreChanges: [1, 0, 1, 2, -2] },
      { key: "C", text: "没边界就不贸然接，别把别人的模糊变成自己的责任。", scoreChanges: [0, -3, -1, -1, 3] }
    ]
  },
  {
    id: 7,
    question: "跨部门协作很慢，每个人都说不是自己卡住的。你更可能？",
    options: [
      { key: "A", text: "直接拉清单盯节点，一个个追到落地。", scoreChanges: [-2, 3, 0, 0, -1] },
      { key: "B", text: "先把各方利益和障碍摸清楚，再找最省力的推进法。", scoreChanges: [1, 0, 1, 2, -2] },
      { key: "C", text: "先看这事值不值得自己卷，烂局没必要全接。", scoreChanges: [1, -3, -1, -2, 3] }
    ]
  },
  {
    id: 8,
    question: "一个你负责的项目，质量和团队关系只能优先保一个。你更偏向？",
    options: [
      { key: "A", text: "宁可得罪人，也要把标准压实，交付不能糊弄。", scoreChanges: [-2, 3, 0, -1, 0] },
      { key: "B", text: "分层处理，核心质量守住，别把人逼到彻底失控。", scoreChanges: [1, 0, 1, 2, -3] },
      { key: "C", text: "差不多能交就行，长期看人被磨坏更伤团队。", scoreChanges: [1, -3, -1, -1, 3] }
    ]
  },
  {
    id: 9,
    question: "你和另一条业务线在争同一块资源。你最可能怎么拿？",
    options: [
      { key: "A", text: "先把盟友和共同诉求拉起来，再去谈判。", scoreChanges: [-2, 0, 3, 1, -1] },
      { key: "B", text: "拿结果和可执行方案去换资源，少做情绪对抗。", scoreChanges: [1, 1, 0, 1, -2] },
      { key: "C", text: "就摆明态度正面争，不私下串联，也不绕圈子。", scoreChanges: [1, -1, -3, -2, 3] }
    ]
  },
  {
    id: 10,
    question: "老板在会上突然问你对某个人事安排怎么看，你知道场上各方都在听。你会？",
    options: [
      { key: "A", text: "先看谁在场、谁会受影响，再决定怎么说。", scoreChanges: [-3, 0, 3, 1, -1] },
      { key: "B", text: "只说能落地的判断，不抢结论，也不给自己立靶子。", scoreChanges: [1, 1, 0, 0, -2] },
      { key: "C", text: "该说就说，立场先摆明，不藏着掖着。", scoreChanges: [2, -1, -3, -1, 3] }
    ]
  },
  {
    id: 11,
    question: "你无意中拿到了竞争对手的软肋。你更倾向怎么用？",
    options: [
      { key: "A", text: "先留着，等最关键的时候再用，价值最大。", scoreChanges: [-3, 0, 3, 1, -1] },
      { key: "B", text: "把它当作谈判筹码，换自己想要的东西。", scoreChanges: [1, 1, 0, 0, -2] },
      { key: "C", text: "公开摆到台面上，让规则去处理，不做私下拿捏。", scoreChanges: [2, -1, -3, -1, 3] }
    ]
  },
  {
    id: 12,
    question: "在复杂局面里，你怎么看“信息透明”这件事？",
    options: [
      { key: "A", text: "牌不能一次亮完，太早透明，往往等于把主动权让出去。", scoreChanges: [-3, 0, 3, 1, -1] },
      { key: "B", text: "关键信息要给，但要看时机和对象，不是谁都适合同步。", scoreChanges: [1, 1, 0, 0, -2] },
      { key: "C", text: "能公开的就公开，复杂问题更需要少一点算计。", scoreChanges: [2, -1, -3, -1, 3] }
    ]
  },
  {
    id: 13,
    question: "你在公开场合被上级点名批评了，但你知道问题并不全在你。你会？",
    options: [
      { key: "A", text: "先把情绪压住，回去再拆解到底该怎么扳回来。", scoreChanges: [0, 1, 1, 3, -2] },
      { key: "B", text: "会当场解释关键事实，但控制住分寸，不把场面搞炸。", scoreChanges: [1, 0, -1, 0, 0] },
      { key: "C", text: "忍不了，必须当场顶回去，不能让人随便压你。", scoreChanges: [-1, -1, 0, -3, 2] }
    ]
  },
  {
    id: 14,
    question: "你负责的业务突然丢了大客户，所有人都在看你接下来会不会失态。你更可能？",
    options: [
      { key: "A", text: "先稳住团队和节奏，再做止损，不给外界看到乱。", scoreChanges: [-1, 0, 1, 3, -1] },
      { key: "B", text: "先确认责任和补救窗口，情绪先放一边，问题要看清。", scoreChanges: [1, 1, -1, 0, -1] },
      { key: "C", text: "先把情绪发出来，不然憋着根本没法继续做事。", scoreChanges: [0, -1, 0, -3, 2] }
    ]
  },
  {
    id: 15,
    question: "一个重要机会迟迟没有明确结果，需要你长期等待。你通常会？",
    options: [
      { key: "A", text: "能忍住，边等边准备，机会没到不代表没在发生。", scoreChanges: [0, 1, 1, 3, -2] },
      { key: "B", text: "会给自己设观察线，过线就调整，不让自己被耗死。", scoreChanges: [1, 0, -1, 0, 0] },
      { key: "C", text: "很难忍，没反馈就容易上头，想立刻换方向。", scoreChanges: [-1, -1, 0, -3, 2] }
    ]
  },
  {
    id: 16,
    question: "公司内部流言四起、人人站队的时候，你更像哪种人？",
    options: [
      { key: "A", text: "越乱越要稳住节奏，别让外部噪音带着自己跑。", scoreChanges: [-1, 0, 1, 3, -1] },
      { key: "B", text: "先确认真假和利益影响，再决定自己怎么表态。", scoreChanges: [1, 1, -1, 0, -1] },
      { key: "C", text: "事情一乱就很容易上头，反而更想立刻做点什么。", scoreChanges: [0, -1, 0, -3, 2] }
    ]
  },
  {
    id: 17,
    question: "有一个高风险但高回报的升职机会，你大概率会？",
    options: [
      { key: "A", text: "机会来了就上，风险本来就是更高位置的门票。", scoreChanges: [-2, 2, 1, -1, 3] },
      { key: "B", text: "想上，但会先算清后手和代价，不会只凭一口气。", scoreChanges: [1, 0, 1, 2, -2] },
      { key: "C", text: "再高的位置，也不值得拿稳定和生活去硬赌。", scoreChanges: [1, -2, -2, -1, -1] }
    ]
  },
  {
    id: 18,
    question: "如果只能选一种职业路径，你更想要哪种？",
    options: [
      { key: "A", text: "天花板更高、竞争更狠的，那样才值得投入。", scoreChanges: [-3, 1, 0, -1, 3] },
      { key: "B", text: "能持续放大自己能力和影响力的，稳扎稳打地往上走。", scoreChanges: [1, 1, 1, 2, -2] },
      { key: "C", text: "更稳、更可控的，留余地比冲高度更重要。", scoreChanges: [2, -2, -1, -1, -1] }
    ]
  },
  {
    id: 19,
    question: "公司发生大变动，很多人恐慌，你看到的第一反应更像是？",
    options: [
      { key: "A", text: "这是往上走的窗口，乱局里往往最容易重新排位。", scoreChanges: [-2, 2, 1, -1, 3] },
      { key: "B", text: "先把事做成，位置该来的时候自然会来。", scoreChanges: [1, 0, 1, 2, -2] },
      { key: "C", text: "先守住本分，别把自己推到太前面去冒不必要的险。", scoreChanges: [1, -2, -2, -1, -1] }
    ]
  },
  {
    id: 20,
    question: "你更想要的“成功”是哪一种？",
    options: [
      { key: "A", text: "拿到更高的位置和更大的影响力，让局面由我来定。", scoreChanges: [-3, 1, 0, -1, 3] },
      { key: "B", text: "把自己那摊事做到不可替代，位置是结果，不是目的。", scoreChanges: [1, 1, 1, 2, -2] },
      { key: "C", text: "活得稳、有余地，不被位置和输赢彻底绑住。", scoreChanges: [2, -2, -1, -1, -1] }
    ]
  },
  {
    id: 21,
    question: "「我很难对真正信任过的人彻底翻脸。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [2, -1, -2, 1, 0] },
      { key: "B", text: "否", scoreChanges: [-2, 1, 2, -1, 0] }
    ]
  },
  {
    id: 22,
    question: "「只要关系够近，我愿意替人扛一部分后果。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [3, 0, -2, 0, -1] },
      { key: "B", text: "否", scoreChanges: [-3, 0, 2, 0, 1] }
    ]
  },
  {
    id: 23,
    question: "「我做决定时，经常会先想这会不会伤到别人。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "否", scoreChanges: [-2, 1, 1, -1, 1] }
    ]
  },
  {
    id: 24,
    question: "「就算利益摆在眼前，我也不太愿意把情分算得太清。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [3, -1, -1, 0, -1] },
      { key: "B", text: "否", scoreChanges: [-3, 1, 1, 0, 1] }
    ]
  },
  {
    id: 25,
    question: "「只要事情归我，我默认结果也归我。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 3, 0, 1, -1] },
      { key: "B", text: "否", scoreChanges: [1, -3, 0, -1, 1] }
    ]
  },
  {
    id: 26,
    question: "「我对“差不多就行”这句话天然反感。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 3, 0, -1, 1] },
      { key: "B", text: "否", scoreChanges: [1, -3, 0, 1, -1] }
    ]
  },
  {
    id: 27,
    question: "「比起讨论感受，我更习惯先推进解决方案。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 2, 1, 1, -1] },
      { key: "B", text: "否", scoreChanges: [1, -2, -1, -1, 1] }
    ]
  },
  {
    id: 28,
    question: "「一个团队最让我受不了的，是事情落不到地。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 3, -1, 0, 1] },
      { key: "B", text: "否", scoreChanges: [1, -3, 1, 0, -1] }
    ]
  },
  {
    id: 29,
    question: "「很多事不是不能说，而是不能太早说。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-2, 0, 3, 1, -2] },
      { key: "B", text: "否", scoreChanges: [2, 0, -3, -1, 2] }
    ]
  },
  {
    id: 30,
    question: "「我天然会先判断，谁能在这件事里成为我的杠杆。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-2, 0, 3, 0, -1] },
      { key: "B", text: "否", scoreChanges: [2, 0, -3, 0, 1] }
    ]
  },
  {
    id: 31,
    question: "「把人和资源排兵布阵，本身就是一种能力。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 0, 3, 1, -1] },
      { key: "B", text: "否", scoreChanges: [1, 0, -3, -1, 1] }
    ]
  },
  {
    id: 32,
    question: "「我不太相信完全透明能解决复杂问题。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-2, 1, 2, 1, -2] },
      { key: "B", text: "否", scoreChanges: [2, -1, -2, -1, 2] }
    ]
  },
  {
    id: 33,
    question: "「越是压力大的时候，我越不想让别人看见我乱。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 1, 1, 3, -1] },
      { key: "B", text: "否", scoreChanges: [0, -1, -1, -3, 1] }
    ]
  },
  {
    id: 34,
    question: "「很多人输，不是输在能力，而是输在情绪先崩。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 0, 1, 3, -1] },
      { key: "B", text: "否", scoreChanges: [1, 0, -1, -3, 1] }
    ]
  },
  {
    id: 35,
    question: "「只要方向没错，慢一点我也能忍。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 1, 1, 3, -2] },
      { key: "B", text: "否", scoreChanges: [0, -1, -1, -3, 2] }
    ]
  },
  {
    id: 36,
    question: "「我很少因为一时的评价就怀疑自己。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 1, 0, 3, -1] },
      { key: "B", text: "否", scoreChanges: [1, -1, 0, -3, 1] }
    ]
  },
  {
    id: 37,
    question: "「我对更高的位置有很明确的渴望。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-2, 1, 0, -1, 3] },
      { key: "B", text: "否", scoreChanges: [2, -1, 0, 1, -3] }
    ]
  },
  {
    id: 38,
    question: "「明知道会累，我也还是想去更大的牌桌。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-2, 2, 1, -1, 3] },
      { key: "B", text: "否", scoreChanges: [2, -2, -1, 1, -3] }
    ]
  },
  {
    id: 39,
    question: "「如果一条路能让我走得更远，我愿意承担更高风险。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 1, 1, -1, 3] },
      { key: "B", text: "否", scoreChanges: [1, -1, -1, 1, -3] }
    ]
  },
  {
    id: 40,
    question: "「我不太满足于把日子过稳，我更想往上够一够。」你是否认同？",
    options: [
      { key: "A", text: "是", scoreChanges: [-2, 1, 0, 0, 3] },
      { key: "B", text: "否", scoreChanges: [2, -1, 0, 0, -3] }
    ]
  }
]
