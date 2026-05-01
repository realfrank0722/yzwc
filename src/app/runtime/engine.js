/**
 * 流程引擎（第一阶段占位）。
 * 下一阶段将把当前 script.js 内流程拆分为事件驱动状态机。
 */
export const EngineState = {
  BOOTSTRAP: "BOOTSTRAP",
  SELECT_SCREENPLAY: "SELECT_SCREENPLAY",
  QUIZ_RUNNING: "QUIZ_RUNNING",
  RESULT_READY: "RESULT_READY",
  POSTER_RENDERING: "POSTER_RENDERING"
};

let currentEngineState = EngineState.BOOTSTRAP;

export function setEngineState(nextState) {
  currentEngineState = nextState;
}

export function getEngineState() {
  return currentEngineState;
}

