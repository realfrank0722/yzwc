import { loadScreenplayManifest } from "./registry.js";
import { setCurrentScreenplay } from "../app/runtime/store.js";
import { createScreenplayAssetResolver } from "./asset-resolver.js";
import { DEFAULT_DIMENSIONS } from "../domain/scoring/score-calculator.js";

function validateDatasetShape(manifest, dataset) {
  const dimensions = Array.isArray(manifest?.dimensions) && manifest.dimensions.length
    ? manifest.dimensions
    : DEFAULT_DIMENSIONS;
  const dimLen = dimensions.length;
  const questions = Array.isArray(dataset?.questions) ? dataset.questions : [];
  const characterMap = dataset?.characterMap || {};

  questions.forEach((q, qIndex) => {
    (q?.options || []).forEach((opt, optIndex) => {
      if (!Array.isArray(opt?.scoreChanges) || opt.scoreChanges.length !== dimLen) {
        throw new Error(
          `题库维度不匹配：question#${qIndex + 1} option#${optIndex + 1} 的 scoreChanges 长度应为 ${dimLen}`
        );
      }
    });
  });

  Object.entries(characterMap).forEach(([key, profile]) => {
    if (!Array.isArray(profile?.stats) || profile.stats.length !== dimLen) {
      throw new Error(`角色维度不匹配：${key}.stats 长度应为 ${dimLen}`);
    }
  });
}

/**
 * 运行时加载剧本数据，并适配到当前旧引擎(window.questions/window.characterMap)。
 * 数据源已改为 ES module 导出，本函数仅保留兼容注入层。
 * 后续逐步迁移后，可将 window 适配层下沉到兼容模块并最终移除。
 */
export async function loadScreenplayRuntime(key) {
  const manifest = await loadScreenplayManifest(key);
  const dataset = await manifest.loadDataset();
  validateDatasetShape(manifest, dataset);
  const resolveAsset = createScreenplayAssetResolver(manifest);

  window.currentScreenplay = {
    key: manifest.key,
    meta: manifest.meta,
    theme: manifest.theme,
    dimensions: manifest.dimensions || DEFAULT_DIMENSIONS,
    poster: manifest.poster,
    assetsBase: manifest.assetsBase || "",
    resolveAsset
  };
  // 兼容旧代码：全局暴露资源解析函数，后续模块可逐步改为注入式调用。
  window.resolveScreenplayAsset = resolveAsset;
  setCurrentScreenplay(manifest);
  window.questions = dataset.questions;
  window.characterMap = dataset.characterMap;

  return { manifest, dataset };
}

