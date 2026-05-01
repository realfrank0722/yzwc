/**
 * 运行时状态容器（第一阶段占位）。
 * 后续会承接：当前剧本、答题进度、用户得分、匹配结果、导出状态等。
 */
export const appStore = {
  screenplayKey: null,
  screenplayMeta: null,
  flowState: "BOOTSTRAP"
};

export function setCurrentScreenplay(manifest) {
  appStore.screenplayKey = manifest?.key || null;
  appStore.screenplayMeta = manifest?.meta || null;
}

export function setFlowState(flowState) {
  appStore.flowState = flowState;
}

