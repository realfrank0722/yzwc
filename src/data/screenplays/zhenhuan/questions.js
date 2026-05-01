const DIMENSION_KEYS = ["emotion", "strategy", "control", "resilience", "courage"];

const DIMENSION_INDEX = Object.fromEntries(
  DIMENSION_KEYS.map((key, index) => [key, index])
);

const LIKERT_OPTIONS = [
  { key: "A", text: "非常同意", intensity: 2 },
  { key: "B", text: "同意", intensity: 1 },
  { key: "C", text: "不同意", intensity: -1 },
  { key: "D", text: "非常不同意", intensity: -2 }
];

function buildEmptyVector() {
  return Array.from({ length: DIMENSION_KEYS.length }, () => 0);
}

function buildOptionsFromCoefficients(coefficients) {
  const normalizedEntries = Object.entries(coefficients || {}).filter(([key, value]) => {
    return DIMENSION_INDEX[key] !== undefined && Number.isFinite(Number(value)) && Number(value) !== 0;
  });
  return LIKERT_OPTIONS.map(({ key, text, intensity }) => {
    const scoreChanges = buildEmptyVector();
    normalizedEntries.forEach(([dimension, coefficient]) => {
      scoreChanges[DIMENSION_INDEX[dimension]] = intensity * Number(coefficient);
    });
    return { key, text, scoreChanges };
  });
}

function buildAnchorOptions(primary, direction, customCoefficients = null) {
  const coefficients = customCoefficients || {
    [primary]: 2 * direction
  };
  return buildOptionsFromCoefficients(coefficients);
}

function buildCrossOptions(primary, secondary, crossCut, customCoefficients = null) {
  const coefficients = customCoefficients || {
    [primary]: 2 * Number(crossCut[primary] || 0),
    [secondary]: Number(crossCut[secondary] || 0)
  };
  return buildOptionsFromCoefficients(coefficients);
}

function createAnchorQuestion(id, primary, direction, stem, notes, customCoefficients = null) {
  return {
    id,
    partition: "anchor",
    stem,
    question: stem,
    primary,
    secondary: null,
    direction,
    crossCut: null,
    notes,
    options: buildAnchorOptions(primary, direction, customCoefficients)
  };
}

function createCrossQuestion(id, primary, secondary, crossCut, stem, notes, customCoefficients = null) {
  return {
    id,
    partition: "cross",
    stem,
    question: stem,
    primary,
    secondary,
    direction: null,
    crossCut,
    notes,
    options: buildCrossOptions(primary, secondary, crossCut, customCoefficients)
  };
}

const anchorQuestions = [
  createAnchorQuestion(
    1,
    "emotion",
    1,
    "我宁愿吃一点现实上的亏，也不想和真正重要的人彻底失去温度。",
    "只测是否愿意为连接让渡利益，不涉及读人或判断能力。"
  ),
  createAnchorQuestion(
    2,
    "emotion",
    1,
    "只要我认定一段连接值得，我愿意先把自己柔软的一面交出去。",
    "选是同时提升情感投入，并轻微降低过度推演倾向。",
    { emotion: 2, strategy: -1 }
  ),
  createAnchorQuestion(
    3,
    "emotion",
    1,
    "为了被真正理解，我愿意主动解释自己，哪怕这会让我显得脆弱。",
    "聚焦深度连接中的自我暴露意愿，不牵拉其他维度。"
  ),
  createAnchorQuestion(
    4,
    "emotion",
    -1,
    "我一旦察觉自己开始依赖谁，就会本能地把情绪抽回来。",
    "用依赖回撤机制表达情感绝缘，而非简单否定共情。"
  ),
  createAnchorQuestion(
    5,
    "emotion",
    -1,
    "我更相信冷处理能保护我，而不是把内心摊开给别人看。",
    "选是体现情感收缩，同时轻微增强防御性推演。",
    { emotion: -2, strategy: 1 }
  ),
  createAnchorQuestion(
    6,
    "emotion",
    -1,
    "在关系里保持无波动，比让人真正走近我更让我安心。",
    "强调情感绝缘带来的安全感，不串到韧性或胆识。"
  ),
  createAnchorQuestion(
    7,
    "strategy",
    1,
    "我常能从一句话里的语气和停顿，判断出对方真正担心的是什么。",
    "只测潜台词解码习惯，不包含控制与善恶判断。"
  ),
  createAnchorQuestion(
    8,
    "strategy",
    1,
    "别人态度一变，我会立刻开始拼背后的动机链条。",
    "聚焦动机推演本能，不涉及是否愿意深度连接。"
  ),
  createAnchorQuestion(
    9,
    "strategy",
    1,
    "在我看来，很多表面选择背后其实都藏着更深的利益分配。",
    "只锚定对信息差与利益链的敏感度，不测狠不狠。"
  ),
  createAnchorQuestion(
    10,
    "strategy",
    -1,
    "只要对方没有把意思说复杂，我通常愿意按最直接的版本去理解。",
    "用表层处理机制表现低心机，而非简单否定猜测。"
  ),
  createAnchorQuestion(
    11,
    "strategy",
    -1,
    "在关系里，我更习惯先看眼前证据，而不是先构建复杂的人心剧本。",
    "选是体现低推演，同时轻微提升流程控制倾向。",
    { strategy: -2, control: 1 }
  ),
  createAnchorQuestion(
    12,
    "strategy",
    -1,
    "在信息不完整时，我宁可先观望，也不急着下“他在算计我”的结论。",
    "选是体现谨慎降噪与情绪缓冲。",
    { emotion: 2 }
  ),
  createAnchorQuestion(
    13,
    "control",
    1,
    "局面一旦失序，我会本能地接管流程，直到节奏重新可控。",
    "直接锚定失序场景下的主导权需求。"
  ),
  createAnchorQuestion(
    14,
    "control",
    1,
    "我很难把关键事务交给不受我校准的人去推进。",
    "只测对变量外包的不适，不涉及耐心或风险偏好。"
  ),
  createAnchorQuestion(
    15,
    "control",
    1,
    "只要变量还在别人手里，我就很难真正放松。",
    "聚焦对失控的焦虑感，不牵拉胆识维。"
  ),
  createAnchorQuestion(
    16,
    "control",
    -1,
    "如果有人愿意把秩序替我搭好，我会很享受那种省心感。",
    "用外包决策的轻松感表达低控制，不是简单说不想掌控。"
  ),
  createAnchorQuestion(
    17,
    "control",
    -1,
    "只要底线还在，我并不执着于由谁来定节奏。",
    "强调让渡主导权的舒适度，不涉及情感依赖。"
  ),
  createAnchorQuestion(
    18,
    "control",
    -1,
    "只要目标和边界说清楚，我可以让别人按自己的方式主导推进。",
    "只测对主导权让渡的容忍度，不碰风险承担。"
  ),
  createAnchorQuestion(
    19,
    "resilience",
    1,
    "只要终点还值得，我可以接受很长一段时间都没有回报。",
    "只测延迟满足能力，不涉及情绪波动或风险态度。"
  ),
  createAnchorQuestion(
    20,
    "resilience",
    1,
    "我能忍受长期不被看见，只要我知道自己还在靠近目标。",
    "聚焦长期边缘化下的目标耐受，不触及情感需要。"
  ),
  createAnchorQuestion(
    21,
    "resilience",
    1,
    "在重要目标上，我能先消化当下委屈，不让情绪打断长期节奏。",
    "选是体现长期耐受，同时轻微增强情势解码。",
    { resilience: 2, strategy: 1 }
  ),
  createAnchorQuestion(
    22,
    "resilience",
    -1,
    "一件事如果长期没有起色，我会倾向于尽快换路而不是继续熬。",
    "用快速换路机制表达低韧性，不涉及情绪崩溃。"
  ),
  createAnchorQuestion(
    23,
    "resilience",
    -1,
    "如果一件事长期重复、单调，我很难一直保持投入。",
    "聚焦抗枯燥不足，不与低反馈混合。"
  ),
  createAnchorQuestion(
    24,
    "resilience",
    -1,
    "只要长期看不到阶段性进展，我就会开始怀疑这件事值不值得继续。",
    "聚焦低反馈下的投入松动，与抗枯燥分离。"
  ),
  createAnchorQuestion(
    25,
    "courage",
    1,
    "如果旧局面已经没有生路，我敢亲手把它打碎再说。",
    "只测是否敢承担破局代价，不涉及是否掌控规则。"
  ),
  createAnchorQuestion(
    26,
    "courage",
    1,
    "只要我判断破局有必要，我愿意承担关系彻底变坏的代价。",
    "聚焦对不可逆冲突成本的容忍，不牵拉控制维。"
  ),
  createAnchorQuestion(
    27,
    "courage",
    1,
    "比起被困在烂局里，我更能接受一次重注带来的后果。",
    "只锚定风险偏好，不测是否有条理或有耐心。"
  ),
  createAnchorQuestion(
    28,
    "courage",
    -1,
    "哪怕现状让我窒息，我也会本能地拖着不去碰那条决裂线。",
    "用守成拖延机制表达低胆识，而非简单否定冒险。"
  ),
  createAnchorQuestion(
    29,
    "courage",
    -1,
    "我对冲突造成的损耗非常敏感，常常宁可忍着也不愿升级。",
    "聚焦损失厌恶，不让句子滑向韧性或情感维。"
  ),
  createAnchorQuestion(
    30,
    "courage",
    -1,
    "只要事情还没坏到最后一步，我通常不会主动打破表面的平衡。",
    "只测对破坏成本的回避，不涉及谁来掌控节奏。"
  )
];

const crossQuestions = [
  createCrossQuestion(
    31,
    "control",
    "courage",
    { control: 1, courage: -1 },
    "我更偏好的破局方式，是在可计算的边界内调整，而不是把自己扔进未知。",
    "用可控破局切开高控制低胆识与纯高胆识人格。"
  ),
  createCrossQuestion(
    32,
    "courage",
    "strategy",
    { courage: 1, strategy: -1 },
    "真到了非变不可的时候，我宁可先掀开局面，即便会丧失一部分控制权。",
    "用果断出手且不做过度推演的偏好，切开冲锋型与稳控型。"
  ),
  createCrossQuestion(
    33,
    "control",
    "courage",
    { control: 1, courage: 1 },
    "在胜负未明时，我敢先把最关键的资源压上去，逼局面提前见分晓。",
    "把敢下重注与主动定盘同时拉高，用于识别强控强搏型。"
  ),
  createCrossQuestion(
    34,
    "strategy",
    "courage",
    { strategy: 1, courage: 1 },
    "在关键博弈里，我会先看清各方底牌再果断出手，而不是凭感觉硬冲。",
    "用看清与出手并存的取向，识别高心机高胆识人格。"
  ),
  createCrossQuestion(
    35,
    "emotion",
    "strategy",
    { emotion: 1, strategy: -1 },                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
    "哪怕我知道把人想简单会吃亏，我还是更愿意先按善意去靠近。",
    "用先连接后判断的取向切开高情感低心机与高心机人格。"
  ),
  createCrossQuestion(
    36,
    "emotion",
    "strategy",
    { emotion: 1, strategy: -1 },
    "做决定时，我更容易被引起我情感共鸣的观点打动，而不是被事实本身说服。",
    "用情感共鸣优先的决策偏好，切开高情感低心机与证据导向型。"
  ),
  createCrossQuestion(
    37,
    "resilience",
    "courage",
    { resilience: 1, courage: -1 },
    "只要还有慢慢翻盘的可能，我不介意继续忍着，而不是立刻把桌子掀翻。",
    "用能熬但不急于决裂的取向切开高韧性低胆识与冲锋型。"
  ),
  createCrossQuestion(
    38,
    "courage",
    "resilience",
    { courage: 1, resilience: -1 },
    "一旦我确认拖下去只会耗掉自己，我会宁可立即决裂也不愿继续熬。",
    "用不肯久熬但敢断裂的偏好切开低韧性高胆识人格。"
  ),
  createCrossQuestion(
    39,
    "control",
    "resilience",
    { control: 1, resilience: 1 },
    "我可以长期按住自己不动声色，只为了把最后的时机和秩序都留在我手里。",
    "把强控制与强延迟同时拉高，用于识别长期布局型人格。"
  ),
  createCrossQuestion(
    40,
    "control",
    "resilience",
    { control: -1, resilience: -1 },
    "如果一件事既难掌控又迟迟不给结果，我通常会很快把它交还给命运。",
    "用放弃主导且不愿久熬的组合切开低控制低韧性人格。"
  )
];

export const questions = [...anchorQuestions, ...crossQuestions];

/* legacy zhenhuan dataset disabled
  // 选择题（1-20）- 个人感受 / 关系心理
  {
    id: 1,
    question: "关系里，你更容易：",
    options: [
      { key: "A", text: "毫无保留地投入", scoreChanges: [4, -1, -2, 0, 2] },
      { key: "B", text: "暗中衡量彼此的筹码", scoreChanges: [-2, 4, 2, 0, 0] },
      { key: "C", text: "保持安全距离，随时准备撤退", scoreChanges: [0, 1, -1, 3, -2] }
    ]
  },
  {
    id: 2,
    question: "面对喜欢的人，你的常态是：",
    options: [
      { key: "A", text: "极度渴望占有与回应", scoreChanges: [4, 0, 3, -2, 1] },
      { key: "B", text: "步步为营，掌握主动权", scoreChanges: [-1, 3, 4, 1, 0] },
      { key: "C", text: "默默守候或克制试探", scoreChanges: [2, 1, -2, 3, -1] }
    ]
  },
  {
    id: 3,
    question: "察觉关系失衡，你更倾向于：",
    options: [
      { key: "A", text: "情绪爆发，当面要个说法", scoreChanges: [3, -2, 1, -2, 4] },
      { key: "B", text: "表面不动声色，暗中重新布局", scoreChanges: [-1, 4, 2, 2, -1] },
      { key: "C", text: "默默收回期待，降低依赖", scoreChanges: [1, 1, -2, 3, 0] }
    ]
  },
  {
    id: 4,
    question: "面对被误解，你的第一反应通常是：",
    options: [
      { key: "A", text: "强烈委屈，拼命自证", scoreChanges: [3, -1, -1, -1, 2] },
      { key: "B", text: "快速分析是谁在造谣、目的是什么", scoreChanges: [-1, 4, 1, 1, 0] },
      { key: "C", text: "懒得解释，懂的自然懂", scoreChanges: [0, 1, 0, 3, 1] }
    ]
  },
  {
    id: 5,
    question: "决定是否信任一个人，你底层的判断依据是：",
    options: [
      { key: "A", text: "对方是否给足了我情绪上的偏爱", scoreChanges: [4, -1, 0, -2, 0] },
      { key: "B", text: "对方的利益是否与我深度绑定", scoreChanges: [-2, 4, 3, 0, 1] },
      { key: "C", text: "对方过往的信誉和边界感", scoreChanges: [0, 2, -1, 3, -1] }
    ]
  },
  {
    id: 6,
    question: "极度高压或危机下，你最容易暴露的本能是：",
    options: [
      { key: "A", text: "不顾一切地反击或爆发", scoreChanges: [2, -2, 1, -3, 4] },
      { key: "B", text: "剥离情感，变成冷血的决策机器", scoreChanges: [-3, 4, 3, 1, 1] },
      { key: "C", text: "极致的忍耐，强行咽下恐惧", scoreChanges: [1, 1, -1, 4, -2] }
    ]
  },
  {
    id: 7,
    question: "让你真正后悔的一段经历，往往是因为：",
    options: [
      { key: "A", text: "当时太冲动，脾气毁了一切", scoreChanges: [3, -2, 1, -2, 2] },
      { key: "B", text: "算错了一步棋，满盘皆输", scoreChanges: [-1, 4, 2, -1, 1] },
      { key: "C", text: "一再退让，失去了底线和自我", scoreChanges: [2, 0, -2, 1, -2] }
    ]
  },
  {
    id: 8,
    question: "你内心最欣赏的“强大”是：",
    options: [
      { key: "A", text: "历经世故，依然敢爱敢恨", scoreChanges: [4, -1, -1, 1, 3] },
      { key: "B", text: "掌控一切，从不暴露软肋", scoreChanges: [-2, 3, 4, 2, 0] },
      { key: "C", text: "熬过至暗时刻，依然静默挺立", scoreChanges: [0, 2, -2, 4, -1] }
    ]
  },
  {
    id: 9,
    question: "发现对方开始冷淡，你会：",
    options: [
      { key: "A", text: "焦虑内耗，试图用力捂热", scoreChanges: [3, 0, 1, -2, -1] },
      { key: "B", text: "及时止损，甚至反向冷冻对方", scoreChanges: [-1, 3, 2, 1, 2] },
      { key: "C", text: "顺其自然，自己默默调整重心", scoreChanges: [1, 1, -2, 3, -1] }
    ]
  },
  {
    id: 10,
    question: "哪种人最容易在你心里留下内耗？",
    options: [
      { key: "A", text: "忽冷忽热、给过我极高期待的人", scoreChanges: [4, 0, -1, -2, 0] },
      { key: "B", text: "城府极深、让我完全看不透的人", scoreChanges: [-1, 4, 2, 0, -1] },
      { key: "C", text: "曾经无条件陪伴，又悄然退场的人", scoreChanges: [2, 1, -2, 2, -1] }
    ]
  },
  {
    id: 11,
    question: "情绪上头时，你最强烈的渴望是：",
    options: [
      { key: "A", text: "把积压的委屈全部倾泻出来", scoreChanges: [4, -2, -1, -3, 2] },
      { key: "B", text: "立刻拿出一个解决方案", scoreChanges: [-2, 3, 4, 0, 1] },
      { key: "C", text: "彻底切断联系，一个人安静待着", scoreChanges: [0, 1, -2, 3, -1] }
    ]
  },
  {
    id: 12,
    question: "面对“不确定的承诺”，你更倾向：",
    options: [
      { key: "A", text: "宁愿盲目相信一次，也不想错过", scoreChanges: [3, -2, -1, 0, 3] },
      { key: "B", text: "索要抵押物或明确的利益保障", scoreChanges: [-2, 4, 3, 0, 1] },
      { key: "C", text: "听听就算了，心里做好最坏打算", scoreChanges: [0, 2, -1, 3, -1] }
    ]
  },
  {
    id: 13,
    question: "走出人生低谷，你更依赖：",
    options: [
      { key: "A", text: "一场彻底的情绪宣泄或新感情", scoreChanges: [4, -1, -1, -1, 2] },
      { key: "B", text: "野心、不甘心和对权力的渴望", scoreChanges: [-1, 3, 4, 2, 1] },
      { key: "C", text: "极致的耐心和时间的治愈", scoreChanges: [1, 2, -2, 4, -1] }
    ]
  },
  {
    id: 14,
    question: "别人持续模糊你的边界时，你的心理过程是：",
    options: [
      { key: "A", text: "烦躁愤怒，随时准备爆炸", scoreChanges: [3, -2, 2, -2, 3] },
      { key: "B", text: "警惕评估，盘算反制手段", scoreChanges: [-1, 4, 3, 1, 0] },
      { key: "C", text: "默默隐忍，但心里不断记账", scoreChanges: [1, 2, -1, 4, -1] }
    ]
  },
  {
    id: 15,
    question: "在一段持续拉扯的关系中，你最容易：",
    options: [
      { key: "A", text: "在爱与恨之间反复横跳", scoreChanges: [4, -1, 1, -2, 1] },
      { key: "B", text: "算清沉没成本，果断切割", scoreChanges: [-2, 4, 2, 1, 3] },
      { key: "C", text: "疲于应对，越来越沉默", scoreChanges: [1, 1, -2, 3, -1] }
    ]
  },
  {
    id: 16,
    question: "受到伤害时，你本能的自我保护机制是：",
    options: [
      { key: "A", text: "像刺猬一样扎伤试图靠近的人", scoreChanges: [3, -2, 2, -2, 3] },
      { key: "B", text: "戴上完美的面具，绝不暴露弱点", scoreChanges: [-2, 4, 3, 2, 0] },
      { key: "C", text: "物理隔离，躲进自己的安全壳里", scoreChanges: [0, 1, -2, 4, -1] }
    ]
  },
  {
    id: 17,
    question: "“被看见”对你而言，真正的含义是：",
    options: [
      { key: "A", text: "所有的情绪和脆弱都能被稳稳托住", scoreChanges: [4, 0, -2, 0, -1] },
      { key: "B", text: "能力、价值和地位被绝对认可", scoreChanges: [-1, 3, 4, 1, 1] },
      { key: "C", text: "自己的底线和空间被充分尊重", scoreChanges: [1, 1, -1, 3, -1] }
    ]
  },
  {
    id: 18,
    question: "当你感到“心累”时，往往是因为：",
    options: [
      { key: "A", text: "给了太多真心，却换来敷衍", scoreChanges: [4, 0, -1, -2, 0] },
      { key: "B", text: "每天都在算计、防备和维持局面", scoreChanges: [-2, 4, 3, 1, 0] },
      { key: "C", text: "一直在委屈自己，成全别人", scoreChanges: [2, 1, -2, 3, -1] }
    ]
  },
  {
    id: 19,
    question: "你在人际交往里的绝对底线更接近于：",
    options: [
      { key: "A", text: "不能忍受敷衍和背叛", scoreChanges: [4, -1, 1, -1, 2] },
      { key: "B", text: "不能挑战我的主导权和利益", scoreChanges: [-2, 3, 4, 0, 1] },
      { key: "C", text: "不能打破我内心的秩序和平静", scoreChanges: [0, 1, -2, 4, -1] }
    ]
  },
  {
    id: 20,
    question: "在极度复杂的环境里，你最信奉的生存法则是：",
    options: [
      { key: "A", text: "凭直觉和本心，不留遗憾", scoreChanges: [3, -2, -1, -1, 4] },
      { key: "B", text: "算无遗策，把一切抓在手里", scoreChanges: [-2, 4, 4, 1, 1] },
      { key: "C", text: "熬住气，活到最后才是赢", scoreChanges: [0, 3, -1, 4, 0] }
    ]
  },

  // 判断题（21-40）
  {
    id: 21,
    question: "“我很难假装自己没感受。”",
    options: [
      { key: "A", text: "是", scoreChanges: [4, -2, -1, 0, -1] },
      { key: "B", text: "否", scoreChanges: [-4, 2, 1, 0, 1] }
    ]
  },
  {
    id: 22,
    question: "“我会对一句看似平常的话反复琢磨。”",
    options: [
      { key: "A", text: "是", scoreChanges: [1, 3, -1, -1, -2] },
      { key: "B", text: "否", scoreChanges: [-1, -3, 1, 1, 2] }
    ]
  },
  {
    id: 23,
    question: "“边界被碰一次，我就会明显提高警惕。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 0, 3, 1, -1] },
      { key: "B", text: "否", scoreChanges: [0, 0, -3, -1, 1] }
    ]
  },
  {
    id: 24,
    question: "“有些话哪怕说了也未必有用，我还是想说清。”",
    options: [
      { key: "A", text: "是", scoreChanges: [2, 0, 2, 0, 1] },
      { key: "B", text: "否", scoreChanges: [-1, 1, 0, 1, -1] }
    ]
  },
  {
    id: 25,
    question: "“关系再近，我也会留一部分给自己。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-2, 0, 2, 2, -2] },
      { key: "B", text: "否", scoreChanges: [2, 0, -2, -1, 1] }
    ]
  },
  {
    id: 26,
    question: "“我更相信行为，而不是承诺。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 3, 0, 1, -1] },
      { key: "B", text: "否", scoreChanges: [0, -3, 0, -1, 1] }
    ]
  },
  {
    id: 27,
    question: "“我不喜欢关系里长期模糊地带。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 0, 3, 1, -1] },
      { key: "B", text: "否", scoreChanges: [0, 0, -3, -1, 1] }
    ]
  },
  {
    id: 28,
    question: "“机会来了，我通常会先动再优化。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, -1, 0, -1, 3] },
      { key: "B", text: "否", scoreChanges: [0, 1, 0, 1, -3] }
    ]
  },
  {
    id: 29,
    question: "“我会在投入前先想最坏结果。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 3, 1, 1, -2] },
      { key: "B", text: "否", scoreChanges: [0, -3, -1, -1, 2] }
    ]
  },
  {
    id: 30,
    question: "“我很怕被当成可有可无的人。”",
    options: [
      { key: "A", text: "是", scoreChanges: [4, 1, -1, 0, -3] },
      { key: "B", text: "否", scoreChanges: [-4, -1, 1, 0, 3] }
    ]
  },
  {
    id: 31,
    question: "“我很多时候不是没脾气，只是觉得没到时候。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 3, 1, 3, -2] },
      { key: "B", text: "否", scoreChanges: [0, -2, -1, -2, 2] }
    ]
  },
  {
    id: 32,
    question: "“对我来说，秩序感能明显降低焦虑。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 0, 3, 2, -2] },
      { key: "B", text: "否", scoreChanges: [0, 0, -3, -2, 2] }
    ]
  },
  {
    id: 33,
    question: "“别人越犹豫，我越容易往前一步。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 0, 0, -1, 4] },
      { key: "B", text: "否", scoreChanges: [1, 0, 0, 1, -4] }
    ]
  },
  {
    id: 34,
    question: "“比起争回来，我更擅长熬过去。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 1, 1, 3, -3] },
      { key: "B", text: "否", scoreChanges: [1, -1, 0, -2, 3] }
    ]
  },
  {
    id: 35,
    question: "“比起被喜欢，我更在意规则还在不在我手里。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 1, 4, 1, -1] },
      { key: "B", text: "否", scoreChanges: [1, 0, -3, 0, 1] }
    ]
  },
  {
    id: 36,
    question: "“我经常在心里做多版本预案。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 3, 1, 2, -2] },
      { key: "B", text: "否", scoreChanges: [0, -3, -1, -2, 2] }
    ]
  },
  {
    id: 37,
    question: "“场面一旦要难看，我常会先把话往回收一寸。”",
    options: [
      { key: "A", text: "是", scoreChanges: [1, 3, 1, 2, -2] },
      { key: "B", text: "否", scoreChanges: [0, -1, 0, -1, 2] }
    ]
  },
  {
    id: 38,
    question: "“关键时刻，我更习惯补位，而不是抢那个最显眼的位置。”",
    options: [
      { key: "A", text: "是", scoreChanges: [2, 2, -1, 2, -2] },
      { key: "B", text: "否", scoreChanges: [0, -1, 2, -1, 2] }
    ]
  },
  {
    id: 39,
    question: "“我宁可慢一点，也不想反复翻车。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-2, 0, 1, 3, -3] },
      { key: "B", text: "否", scoreChanges: [1, 0, -1, -3, 3] }
    ]
  },
  {
    id: 40,
    question: "“如果出现一次跃迁机会，我愿意冒险。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-2, 0, -1, 0, 4] },
      { key: "B", text: "否", scoreChanges: [1, 1, 1, 1, -4] }
    ]
  }
];

/* duplicate rebuild history retained below for now
  // 选择题（1-20）- 个人感受 / 关系心理
  {
    id: 1,
    question: "当你感觉被忽视时，你通常先做什么？",
    options: [
      { key: "A", text: "会先难过，忍不住想自己是不是没那么重要。", scoreChanges: [3, 0, -2, 0, -1] },
      { key: "B", text: "会回想最近的细节，想弄清楚到底哪里变了。", scoreChanges: [1, 3, -1, 0, -2] },
      { key: "C", text: "会先把期待收回来，不让自己继续被吊着。", scoreChanges: [0, 0, 3, 1, -2] },
      { key: "D", text: "会想，不如直接问个明白，别再猜。", scoreChanges: [1, -1, 0, -1, 3] }
    ]
  },
  {
    id: 2,
    question: "关系出现裂痕时，你最在意哪件事？",
    options: [
      { key: "A", text: "还有没有继续真诚沟通的可能。", scoreChanges: [3, -1, -2, 1, -1] },
      { key: "B", text: "这道裂痕背后，真正的原因是什么。", scoreChanges: [0, 3, 0, 0, -1] },
      { key: "C", text: "以后怎样防止自己再掉进同样的局里。", scoreChanges: [0, 1, 3, 1, -2] },
      { key: "D", text: "现在该不该立刻止损，不再拖下去。", scoreChanges: [0, -1, 0, -1, 3] }
    ]
  },
  {
    id: 3,
    question: "你最怕自己在关系里变成什么样？",
    options: [
      { key: "A", text: "变成明明受伤了还在硬撑温柔的人。", scoreChanges: [3, 0, -1, 1, -1] },
      { key: "B", text: "变成永远看不清人、看不清局的人。", scoreChanges: [0, 3, 0, 0, -1] },
      { key: "C", text: "变成没有边界、谁都能碰你的人。", scoreChanges: [-1, 0, 3, 1, -2] },
      { key: "D", text: "变成什么都知道，却总在关键时刻不敢选的人。", scoreChanges: [0, 1, 0, 0, -3] }
    ]
  },
  {
    id: 4,
    question: "当你被误解，但解释又会显得自己很被动时，你更可能：",
    options: [
      { key: "A", text: "还是想解释，因为我受不了关系继续坏下去。", scoreChanges: [3, -1, -2, 0, 0] },
      { key: "B", text: "先想清楚是谁在推动误解，再决定要不要说。", scoreChanges: [0, 3, 1, 0, -1] },
      { key: "C", text: "不急着解释，先把自己拉回不被动的位置。", scoreChanges: [0, 0, 3, 1, -1] },
      { key: "D", text: "索性当场说清，哪怕气氛难看一点。", scoreChanges: [1, -1, 0, -1, 3] }
    ]
  },
  {
    id: 5,
    question: "你决定要不要信一个人，最看重的其实是：",
    options: [
      { key: "A", text: "他能不能真诚接住我的感受。", scoreChanges: [3, 0, -1, 0, -1] },
      { key: "B", text: "他说的话和做的事能不能对得上。", scoreChanges: [0, 3, 0, 0, -1] },
      { key: "C", text: "他是否尊重你的边界和分寸。", scoreChanges: [0, 0, 3, 1, -2] },
      { key: "D", text: "关键时刻他敢不敢站出来。", scoreChanges: [0, -1, 0, 0, 3] }
    ]
  },
  {
    id: 6,
    question: "关系里的高压时刻最能暴露你哪种本能？",
    options: [
      { key: "A", text: "先顾情绪，别让彼此彻底说不出话。", scoreChanges: [3, -1, -2, 1, -1] },
      { key: "B", text: "先分析变量，找真正的问题点。", scoreChanges: [0, 3, 0, 0, -1] },
      { key: "C", text: "先稳住局面，不让事情继续失控。", scoreChanges: [0, 0, 3, 2, -2] },
      { key: "D", text: "先做一个决定，不再让局面拖着走。", scoreChanges: [0, -1, 0, 0, 3] }
    ]
  },
  {
    id: 7,
    question: "如果你对一件事感到后悔，你更常后悔的是：",
    options: [
      { key: "A", text: "当时太心软，没有护住自己。", scoreChanges: [3, 0, -2, 1, -1] },
      { key: "B", text: "其实早有信号，只是我当时没看深。", scoreChanges: [0, 3, 0, 0, -1] },
      { key: "C", text: "明明知道要稳住位置，却还是让了出去。", scoreChanges: [0, 0, 3, 1, -2] },
      { key: "D", text: "方向都看到了，最后却没敢选。", scoreChanges: [0, 1, 0, 0, -3] }
    ]
  },
  {
    id: 8,
    question: "你最欣赏哪种强大？",
    options: [
      { key: "A", text: "受过伤，仍保留真心。", scoreChanges: [3, 0, -1, 1, -1] },
      { key: "B", text: "看得透，却不轻易翻牌。", scoreChanges: [0, 3, 0, 1, -1] },
      { key: "C", text: "掌着局，还守着分寸。", scoreChanges: [0, 0, 3, 1, -2] },
      { key: "D", text: "到了关键处，能一锤定音。", scoreChanges: [0, -1, 0, 0, 3] }
    ]
  },
  {
    id: 9,
    question: "当你察觉一段关系在降温时，你最先会：",
    options: [
      { key: "A", text: "主动靠近，看能不能把那点热度救回来。", scoreChanges: [3, -1, -2, 0, 1] },
      { key: "B", text: "先观察，不急着把情绪暴露出去。", scoreChanges: [0, 3, 0, 0, -1] },
      { key: "C", text: "开始降低依赖，把重心收回自己。", scoreChanges: [0, 0, 3, 1, -2] },
      { key: "D", text: "会想，不如趁还没更糟前先转身。", scoreChanges: [0, -1, 0, -1, 3] }
    ]
  },
  {
    id: 10,
    question: "你更容易被哪种人伤到？",
    options: [
      { key: "A", text: "表面亲近，情感上却长期冷处理的人。", scoreChanges: [3, 0, -1, 0, -1] },
      { key: "B", text: "说得很好听，但动机并不干净的人。", scoreChanges: [0, 3, 0, 0, -1] },
      { key: "C", text: "总在你边界上试探，像是在量你底线的人。", scoreChanges: [0, 0, 3, 1, -2] },
      { key: "D", text: "平时都好，关键时刻却突然退缩的人。", scoreChanges: [0, -1, 0, -1, 3] }
    ]
  },
  {
    id: 11,
    question: "你在情绪上头的时候，最常见的模式是：",
    options: [
      { key: "A", text: "更想被理解，表达会变得直接。", scoreChanges: [3, 0, -2, 0, 1] },
      { key: "B", text: "会反复推演对方到底在想什么。", scoreChanges: [1, 3, -1, 0, -2] },
      { key: "C", text: "会先把边界收紧，不让局面再乱。", scoreChanges: [0, 0, 3, 1, -2] },
      { key: "D", text: "会很想快点做个决定，把拉扯斩断。", scoreChanges: [0, -1, 0, -1, 3] }
    ]
  },
  {
    id: 12,
    question: "面对“不确定的承诺”，你更倾向：",
    options: [
      { key: "A", text: "先看他是不是还愿意持续回应。", scoreChanges: [3, 0, -1, 0, -1] },
      { key: "B", text: "先看他的历史行为值不值得信。", scoreChanges: [0, 3, 0, 0, -1] },
      { key: "C", text: "先看这段关系有没有明确边界。", scoreChanges: [0, 0, 3, 1, -2] },
      { key: "D", text: "先看真到关键时刻他会不会动。", scoreChanges: [0, -1, 0, 0, 3] }
    ]
  },
  {
    id: 13,
    question: "你更常靠什么把自己从低谷里拉出来？",
    options: [
      { key: "A", text: "和值得的人重新建立情绪连接。", scoreChanges: [3, 0, -1, 1, -1] },
      { key: "B", text: "复盘，看自己到底在哪一步看错了。", scoreChanges: [0, 3, 0, 1, -1] },
      { key: "C", text: "重建生活秩序，把自己先稳住。", scoreChanges: [0, 0, 3, 2, -2] },
      { key: "D", text: "做一个能立刻推进的决定。", scoreChanges: [0, -1, 0, 0, 3] }
    ]
  },
  {
    id: 14,
    question: "别人持续模糊你的边界时，你通常：",
    options: [
      { key: "A", text: "会先讲感受，希望关系别走到难看。", scoreChanges: [3, -1, -2, 1, -1] },
      { key: "B", text: "会先判断，对方到底是无意还是试探。", scoreChanges: [0, 3, 1, 0, -1] },
      { key: "C", text: "会直接明确规则和后果。", scoreChanges: [0, 0, 4, 1, -2] },
      { key: "D", text: "会想，既然到了这一步，不如干脆切掉。", scoreChanges: [0, -1, 0, -1, 3] }
    ]
  },
  {
    id: 15,
    question: "在一段持续拉扯的关系里，你最容易先做的是：",
    options: [
      { key: "A", text: "再试一次修复，至少别留遗憾。", scoreChanges: [3, 0, -2, 0, 1] },
      { key: "B", text: "停下来观察，把人看清后再动。", scoreChanges: [0, 3, 0, 0, -1] },
      { key: "C", text: "先稳住自己的生活节奏，减少被影响。", scoreChanges: [0, 0, 3, 2, -2] },
      { key: "D", text: "果断退出，不再让自己反复循环。", scoreChanges: [0, -1, 0, -1, 3] }
    ]
  },
  {
    id: 16,
    question: "你觉得自己在关系中的短板更像：",
    options: [
      { key: "A", text: "情绪投得太深，回撤太难。", scoreChanges: [3, 0, -2, -1, -1] },
      { key: "B", text: "想得太多，行动总慢半拍。", scoreChanges: [1, 3, -1, -1, -2] },
      { key: "C", text: "太想稳住局面，反而容易绷紧。", scoreChanges: [0, 0, 3, -1, -1] },
      { key: "D", text: "决定太快，容易把局压得太重。", scoreChanges: [0, -1, 1, -2, 2] }
    ]
  },
  {
    id: 17,
    question: "“被看见”对你来说更像：",
    options: [
      { key: "A", text: "我的感受被认真接住。", scoreChanges: [3, 0, -1, 0, -1] },
      { key: "B", text: "我的判断被真正认可。", scoreChanges: [0, 3, 0, 0, -1] },
      { key: "C", text: "我的边界和位置被尊重。", scoreChanges: [0, 0, 3, 1, -2] },
      { key: "D", text: "我的选择在关键时刻被站队。", scoreChanges: [0, -1, 0, 0, 3] }
    ]
  },
  {
    id: 18,
    question: "当你说“我累了”，真正累的是：",
    options: [
      { key: "A", text: "一直在情绪上自己消化自己。", scoreChanges: [3, 0, -1, 2, -1] },
      { key: "B", text: "一直在脑子里反复推演别人。", scoreChanges: [1, 3, -1, -1, -2] },
      { key: "C", text: "一直在维持秩序、维持分寸。", scoreChanges: [0, 1, 3, 1, -2] },
      { key: "D", text: "总是在关键时刻扛决定。", scoreChanges: [0, -1, 0, -1, 3] }
    ]
  },
  {
    id: 19,
    question: "你在关系里的底线，更接近：",
    options: [
      { key: "A", text: "可以争执，不能冷漠。", scoreChanges: [3, 0, -1, 0, -1] },
      { key: "B", text: "可以沉默，不能欺骗。", scoreChanges: [0, 3, 0, 0, -1] },
      { key: "C", text: "可以妥协，不能失控。", scoreChanges: [0, 0, 3, 1, -2] },
      { key: "D", text: "可以等待，不能永远不决定。", scoreChanges: [0, 1, 0, 0, -3] }
    ]
  },
  {
    id: 20,
    question: "如果只能保留一种能力，你会保留：",
    options: [
      { key: "A", text: "共情和连接。", scoreChanges: [3, 0, -1, 0, -1] },
      { key: "B", text: "识人和洞察。", scoreChanges: [0, 3, 0, 0, -1] },
      { key: "C", text: "控场和边界。", scoreChanges: [0, 0, 3, 1, -2] },
      { key: "D", text: "决断和出手。", scoreChanges: [0, -1, 0, -1, 4] }
    ]
  },

  // 判断题（21-40）
  {
    id: 21,
    question: "“我很难假装自己没感受。”",
    options: [
      { key: "A", text: "是", scoreChanges: [3, 0, -1, 0, -1] },
      { key: "B", text: "否", scoreChanges: [-3, 0, 1, 0, 1] }
    ]
  },
  {
    id: 22,
    question: "“我会对一句看似平常的话反复琢磨。”",
    options: [
      { key: "A", text: "是", scoreChanges: [1, 3, -1, -1, -2] },
      { key: "B", text: "否", scoreChanges: [-1, -3, 1, 1, 2] }
    ]
  },
  {
    id: 23,
    question: "“边界被碰一次，我就会明显提高警惕。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 0, 3, 1, -1] },
      { key: "B", text: "否", scoreChanges: [0, 0, -3, -1, 1] }
    ]
  },
  {
    id: 24,
    question: "“我经常知道该做什么，却拖到最后。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 1, 0, 0, -3] },
      { key: "B", text: "否", scoreChanges: [0, -1, 0, 0, 3] }
    ]
  },
  {
    id: 25,
    question: "“关系再近，我也会留一部分给自己。”",
    options: [
      { key: "A", text: "是", scoreChanges: [1, 0, 2, 1, -1] },
      { key: "B", text: "否", scoreChanges: [-1, 0, -2, -1, 1] }
    ]
  },
  {
    id: 26,
    question: "“我更相信行为，而不是承诺。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 3, 0, 1, -1] },
      { key: "B", text: "否", scoreChanges: [0, -3, 0, -1, 1] }
    ]
  },
  {
    id: 27,
    question: "“我不喜欢关系里长期模糊地带。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 0, 3, 1, -1] },
      { key: "B", text: "否", scoreChanges: [0, 0, -3, -1, 1] }
    ]
  },
  {
    id: 28,
    question: "“机会来了，我通常会先动再优化。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, -1, 0, -1, 3] },
      { key: "B", text: "否", scoreChanges: [0, 1, 0, 1, -3] }
    ]
  },
  {
    id: 29,
    question: "“我会在投入前先想最坏结果。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 3, 1, 1, -2] },
      { key: "B", text: "否", scoreChanges: [0, -3, -1, -1, 2] }
    ]
  },
  {
    id: 30,
    question: "“我很怕被当成可有可无的人。”",
    options: [
      { key: "A", text: "是", scoreChanges: [3, 1, -1, 0, -2] },
      { key: "B", text: "否", scoreChanges: [-3, -1, 1, 0, 2] }
    ]
  },
  {
    id: 31,
    question: "“我会把很多判断放在心里，不急着说出来。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 2, 1, 1, -2] },
      { key: "B", text: "否", scoreChanges: [0, -2, -1, -1, 2] }
    ]
  },
  {
    id: 32,
    question: "“对我来说，秩序感能明显降低焦虑。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 0, 3, 2, -2] },
      { key: "B", text: "否", scoreChanges: [0, 0, -3, -2, 2] }
    ]
  },
  {
    id: 33,
    question: "“别人越犹豫，我越容易往前一步。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, -1, 0, -1, 3] },
      { key: "B", text: "否", scoreChanges: [0, 1, 0, 1, -3] }
    ]
  },
  {
    id: 34,
    question: "“我能长期承压，不靠情绪推进事情。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 0, 0, 3, -1] },
      { key: "B", text: "否", scoreChanges: [0, 0, 0, -3, 1] }
    ]
  },
  {
    id: 35,
    question: "“比起被喜欢，我更在意被尊重。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 0, 3, 0, -1] },
      { key: "B", text: "否", scoreChanges: [0, 0, -3, 0, 1] }
    ]
  },
  {
    id: 36,
    question: "“我经常在心里做多版本预案。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 3, 1, 2, -2] },
      { key: "B", text: "否", scoreChanges: [0, -3, -1, -2, 2] }
    ]
  },
  {
    id: 37,
    question: "“我不喜欢把主动权交给运气。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 1, 2, 1, 0] },
      { key: "B", text: "否", scoreChanges: [0, -1, -2, -1, 0] }
    ]
  },
  {
    id: 38,
    question: "“我会有意识控制自己暴露的情绪深度。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 2, 1, 1, -2] },
      { key: "B", text: "否", scoreChanges: [0, -2, -1, -1, 2] }
    ]
  },
  {
    id: 39,
    question: "“我宁可慢一点，也不想反复翻车。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 1, 1, 3, -3] },
      { key: "B", text: "否", scoreChanges: [0, -1, -1, -3, 3] }
    ]
  },
  {
    id: 40,
    question: "“如果出现一次跃迁机会，我愿意冒险。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, -1, 0, -1, 3] },
      { key: "B", text: "否", scoreChanges: [0, 1, 0, 1, -3] }
    ]
  }
*/

/* duplicate rebuild history retained below for now
  // 选择题（1-20）- 个人感受导向
  // 基础策略分值（按心理策略设计，避免结构性偏置）：
  // 情感优先: [2, -1, -1, 1, -1]
  // 洞察优先: [-1, 2, 0, 0, -1]
  // 控场优先: [-1, 0, 2, 1, -2]
  // 决断优先: [0, -1, -1, -2, 4]
  {
    id: 1,
    question: "当你感觉被忽视时，你通常先做什么？",
    options: [
      { key: "A", text: "先表达感受，确认对方是否还在意。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "先观察细节，判断是误会还是信号。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "先收回投入，重设边界。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "先做决定，不再被动等待。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 2,
    question: "关系出现裂痕时，你最在意哪件事？",
    options: [
      { key: "A", text: "还有没有真实沟通的可能。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "裂痕背后真正原因是什么。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "以后怎样防止再次失控。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "现在该不该立刻止损离开。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 3,
    question: "你最怕自己在关系里变成：",
    options: [
      { key: "A", text: "没有温度的人。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "看不清局的人。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "没有边界的人。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "关键时刻不敢选的人。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 4,
    question: "当你被误解时，你更可能：",
    options: [
      { key: "A", text: "先解释感受，避免关系继续坏下去。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "先搞清是谁在制造误解。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "先稳住局面，再决定要不要解释。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "直接澄清或切割，不再拖。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 5,
    question: "你决定信不信一个人，最看重：",
    options: [
      { key: "A", text: "他能否真诚回应你。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "他是否长期言行一致。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "他是否尊重边界和规则。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "他在关键节点敢不敢担责。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 6,
    question: "遇到强压时，你最本能的方式是：",
    options: [
      { key: "A", text: "先稳住情绪关系，别让人先散。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "先分析变量，找真正风险。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "先控节奏，缩小问题面。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "先做一个决断动作。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 7,
    question: "如果你后悔了一件事，最常后悔的是：",
    options: [
      { key: "A", text: "太心软，没保护好自己。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "太轻信，没看懂人心。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "太被动，主导权交出去了。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "太犹豫，该选时没选。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 8,
    question: "你最欣赏哪种“强”？",
    options: [
      { key: "A", text: "受伤后仍有温度。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "看透后仍克制。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "掌局但不失边界。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "高压下敢一锤定音。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 9,
    question: "当你发现关系温度下降时，你会：",
    options: [
      { key: "A", text: "主动靠近，先修复连接。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "先观察，不急着暴露底牌。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "降低依赖，回收个人边界。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "直接重选方向。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 10,
    question: "你更容易被哪种人伤到？",
    options: [
      { key: "A", text: "表面亲近，情感上却长期冷处理。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "说得漂亮，动机却不干净。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "总在你边界上反复试探。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "关键节点临阵退缩。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 11,
    question: "你在情绪上头时，最常出现的模式是：",
    options: [
      { key: "A", text: "想被理解，表达会变得很直接。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "会反复推演对方真正意图。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "会先把边界和规则拉紧。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "会快速下决定结束拉扯。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 12,
    question: "面对“不确定的承诺”，你更倾向：",
    options: [
      { key: "A", text: "看对方是否愿意持续回应。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "看对方历史行为是否可验证。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "看是否有明确边界和规则。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "看关键时刻能否立即行动。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 13,
    question: "你更常靠什么让自己走出低谷？",
    options: [
      { key: "A", text: "和可信的人建立情绪连接。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "复盘模式，找出认知盲区。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "重建生活和关系秩序。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "做一个能立刻推进的决定。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 14,
    question: "别人持续模糊你的边界时，你通常：",
    options: [
      { key: "A", text: "先讲感受，希望对方自觉调整。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "先判断对方是无意还是试探。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "直接明确规则和后果。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "触线就切，避免继续消耗。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 15,
    question: "在一段拉扯关系里，你最容易先做的是：",
    options: [
      { key: "A", text: "尝试修复，给关系一次机会。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "停下来观察，把人看清再说。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "先稳住自我秩序，减少被影响。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "果断退出，不再循环。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 16,
    question: "你觉得自己在关系中的短板更像：",
    options: [
      { key: "A", text: "情绪投入太深，容易受伤。", scoreChanges: [2, -1, -1, -1, -1] },
      { key: "B", text: "想得太多，行动偏慢。", scoreChanges: [1, 2, -1, -2, -2] },
      { key: "C", text: "控制需求强，容易绷紧。", scoreChanges: [-1, 0, 2, -1, -1] },
      { key: "D", text: "决定太快，可能压错注。", scoreChanges: [0, -1, 0, -2, 3] }
    ]
  },
  {
    id: 17,
    question: "“被看见”对你来说更像：",
    options: [
      { key: "A", text: "我的感受被认真接住。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "我的判断被认可。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "我的边界被尊重。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "我的决定被执行。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 18,
    question: "当你说“我累了”，真正累的是：",
    options: [
      { key: "A", text: "一直在情绪上自我消化。", scoreChanges: [2, -1, -1, 2, -1] },
      { key: "B", text: "一直在脑内推演别人。", scoreChanges: [1, 2, -1, -1, -2] },
      { key: "C", text: "一直在维持秩序与边界。", scoreChanges: [-1, 1, 2, 1, -2] },
      { key: "D", text: "一直在关键时刻扛决定。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 19,
    question: "你在关系中的底线，更接近：",
    options: [
      { key: "A", text: "可以争执，不能冷漠。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "可以沉默，不能欺骗。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "可以妥协，不能失控。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "可以等待，不能不决定。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },
  {
    id: 20,
    question: "如果只能保留一种能力，你会保留：",
    options: [
      { key: "A", text: "共情和连接能力。", scoreChanges: [2, -1, -1, 1, -1] },
      { key: "B", text: "识人和洞察能力。", scoreChanges: [-1, 2, 0, 0, -1] },
      { key: "C", text: "控场和边界能力。", scoreChanges: [-1, 0, 2, 1, -2] },
      { key: "D", text: "决断和出手能力。", scoreChanges: [0, -1, -1, -2, 4] }
    ]
  },

  // 判断题（21-40）
  {
    id: 21,
    question: "“我很难假装自己没感受。”",
    options: [
      { key: "A", text: "是", scoreChanges: [2, -1, -1, 0, -1] },
      { key: "B", text: "否", scoreChanges: [-2, 1, 1, 0, 1] }
    ]
  },
  {
    id: 22,
    question: "“我会对一句看似平常的话反复琢磨。”",
    options: [
      { key: "A", text: "是", scoreChanges: [1, 2, -1, -1, -2] },
      { key: "B", text: "否", scoreChanges: [-1, -2, 1, 1, 2] }
    ]
  },
  {
    id: 23,
    question: "“边界被碰一次，我就会提高警惕。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 0, 2, 1, -1] },
      { key: "B", text: "否", scoreChanges: [1, 0, -2, -1, 1] }
    ]
  },
  {
    id: 24,
    question: "“我常常知道该做什么，但会拖到最后。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 1, 0, 1, -2] },
      { key: "B", text: "否", scoreChanges: [0, -1, 0, -1, 2] }
    ]
  },
  {
    id: 25,
    question: "“关系再重要，我也会留一部分给自己。”",
    options: [
      { key: "A", text: "是", scoreChanges: [1, 0, 1, 1, -1] },
      { key: "B", text: "否", scoreChanges: [-1, 0, -1, -1, 1] }
    ]
  },
  {
    id: 26,
    question: "“我更相信行为，而不是承诺。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 2, 0, 1, -1] },
      { key: "B", text: "否", scoreChanges: [1, -2, 0, -1, 1] }
    ]
  },
  {
    id: 27,
    question: "“我不喜欢关系里长期模糊地带。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 0, 2, 1, -1] },
      { key: "B", text: "否", scoreChanges: [1, 0, -2, -1, 1] }
    ]
  },
  {
    id: 28,
    question: "“机会来了，我通常会先动再优化。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, -1, -1, -1, 3] },
      { key: "B", text: "否", scoreChanges: [0, 1, 1, 1, -3] }
    ]
  },
  {
    id: 29,
    question: "“我会在投入前先想最坏结果。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 2, 1, 1, -1] },
      { key: "B", text: "否", scoreChanges: [1, -2, -1, -1, 1] }
    ]
  },
  {
    id: 30,
    question: "“我很怕被当成可有可无的人。”",
    options: [
      { key: "A", text: "是", scoreChanges: [2, -1, -1, 0, -1] },
      { key: "B", text: "否", scoreChanges: [-2, 1, 1, 0, 1] }
    ]
  },
  {
    id: 31,
    question: "“我会把很多判断放到心里，不急着说。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 2, 0, 1, -1] },
      { key: "B", text: "否", scoreChanges: [1, -2, 0, -1, 1] }
    ]
  },
  {
    id: 32,
    question: "“对我来说，秩序感能明显降低焦虑。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 0, 2, 1, -1] },
      { key: "B", text: "否", scoreChanges: [1, 0, -2, -1, 1] }
    ]
  },
  {
    id: 33,
    question: "“别人越犹豫，我越容易上一步。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, -1, -1, -1, 3] },
      { key: "B", text: "否", scoreChanges: [0, 1, 1, 1, -3] }
    ]
  },
  {
    id: 34,
    question: "“我能长期承压，不靠情绪推进。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 0, 0, 2, -1] },
      { key: "B", text: "否", scoreChanges: [0, 0, 0, -2, 1] }
    ]
  },
  {
    id: 35,
    question: "“比起被喜欢，我更在意被尊重。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 0, 2, 0, -1] },
      { key: "B", text: "否", scoreChanges: [1, 0, -2, 0, 1] }
    ]
  },
  {
    id: 36,
    question: "“我经常在心里做‘多版本预案’。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 2, 1, 2, -1] },
      { key: "B", text: "否", scoreChanges: [1, -2, -1, -2, 1] }
    ]
  },
  {
    id: 37,
    question: "“我不喜欢把主动权交给运气。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 0, 1, 1, 1] },
      { key: "B", text: "否", scoreChanges: [0, 0, -1, -1, -1] }
    ]
  },
  {
    id: 38,
    question: "“我会有意识控制自己暴露的情绪深度。”",
    options: [
      { key: "A", text: "是", scoreChanges: [-1, 1, 1, 1, -1] },
      { key: "B", text: "否", scoreChanges: [1, -1, -1, -1, 1] }
    ]
  },
  {
    id: 39,
    question: "“我宁可慢一点，也不想反复翻车。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 1, 1, 2, -2] },
      { key: "B", text: "否", scoreChanges: [0, -1, -1, -2, 2] }
    ]
  },
  {
    id: 40,
    question: "“如果出现一次跃迁机会，我会愿意冒险。”",
    options: [
      { key: "A", text: "是", scoreChanges: [0, 0, -1, -1, 3] },
      { key: "B", text: "否", scoreChanges: [0, 0, 1, 1, -3] }
    ]
  }
*/

