/**
 * 剧本注册中心：引擎只面向 key，不关心具体剧本实现。
 */
const screenplayRegistry = new Map([
  [
    "yongzheng",
    () => import("../data/screenplays/yongzheng/manifest.js")
  ],
  [
    "zhenhuan",
    () => import("../data/screenplays/zhenhuan/manifest.js")
  ]
]);

export function listRegisteredScreenplays() {
  return [...screenplayRegistry.keys()];
}

export async function loadScreenplayManifest(key) {
  const loader = screenplayRegistry.get(key);
  if (!loader) {
    throw new Error(`未注册的剧本：${key}`);
  }
  const mod = await loader();
  return mod.default;
}

