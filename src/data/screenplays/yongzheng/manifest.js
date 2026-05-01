const manifest = {
  key: "yongzheng",
  meta: {
    title: "雍正王朝",
    subtitle: "九子夺嫡·权谋人格测试",
    description: "当前默认剧本"
  },
  theme: {
    // 先保留占位，后续迁移到主题系统（CSS 变量映射）
    palette: "yongzheng-default"
  },
  dimensions: [
    { key: "renwei", label: "人味", shortLabel: "人味", weight: 1.05 },
    { key: "zuoshi", label: "做事", shortLabel: "做事", weight: 1.15 },
    { key: "quanmou", label: "权谋", shortLabel: "权谋", weight: 1.1 },
    { key: "xintai", label: "心态", shortLabel: "心态", weight: 1.0 },
    { key: "yexin", label: "野心", shortLabel: "野心", weight: 1.15 }
  ],
  poster: {
    authorLine: "作者：36",
    socialLine: "小红书：5040605569 抖音：30709022806",
    ctaLine: "关注解锁更多",
    mode: "static-image",
    basePath: "assets/screenplays/yongzheng/posters",
    ext: ".png",
    fallback: "default.png"
  },
  assetsBase: "assets/screenplays/yongzheng",
  async loadDataset() {
    // 过渡阶段：通过 data 层聚合入口读取，不再依赖 window 注入。
    const datasetModule = await import("./dataset.js");
    return {
      questions: datasetModule.questions || [],
      characterMap: datasetModule.characterMap || {}
    };
  }
};

export default manifest;

