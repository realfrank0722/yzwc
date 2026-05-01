const manifest = {
  key: "zhenhuan",
  meta: {
    title: "甄嬛传",
    subtitle: "深宫人性·关系人格测试",
    description: "测的不是剧情立场，而是你在关系中的生存方式。"
  },
  theme: {
    palette: "zhenhuan-default"
  },
  dimensions: [
    { key: "emotion", label: "情感", shortLabel: "情感", weight: 1.08 },
    { key: "strategy", label: "心机", shortLabel: "心机", weight: 1.15 },
    { key: "control", label: "控制", shortLabel: "控制", weight: 1.12 },
    { key: "resilience", label: "韧性", shortLabel: "韧性", weight: 1.05 },
    { key: "courage", label: "胆识", shortLabel: "胆识", weight: 1.1 }
  ],
  poster: {
    authorLine: "作者：36",
    socialLine: "小红书：5040605569 抖音：30709022806",
    ctaLine: "关注解锁更多",
    mode: "static-image",
    basePath: "assets/screenplays/zhenhuan/posters",
    ext: ".png",
    fallback: "default.png"
  },
  assetsBase: "assets/screenplays/zhenhuan",
  async loadDataset() {
    const datasetModule = await import("./dataset.js");
    return {
      questions: datasetModule.questions || [],
      characterMap: datasetModule.characterMap || {}
    };
  }
};

export default manifest;

