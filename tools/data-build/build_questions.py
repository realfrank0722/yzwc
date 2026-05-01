# -*- coding: utf-8 -*-
"""
重写 questions.js 中 40 道题的 scoreChanges（-3 ~ +3，有正有负体现 trade-off）。
题干文字、选项文字、characterMap 一字不改。
维度顺序：[人味, 做事, 权谋, 心态, 野心]
"""
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
QUESTIONS_JS = PROJECT_ROOT / "src" / "data" / "screenplays" / "yongzheng" / "questions.js"

# ── 仅 scoreChanges，顺序与题目中选项顺序严格一致 ─────────────────────────
# 每条规则：有得必有失，正负同存。范围 -3 ~ +3。
NEW_SCORES = {
    # ── 选择题（Q1–Q20，每题 A/B/C）──────────────────────────────────────
    1:  [[-3,  2,  1,  0,  2], [ 3,  0, -1,  1, -2], [-2,  2,  0, -1,  3]],
    2:  [[ 3, -2, -2, -1, -1], [ 1,  0,  1,  2, -1], [-1,  1,  2,  2,  0]],
    3:  [[ 1,  2, -1,  1,  0], [-1,  0,  3,  1,  0], [-3,  3,  0,  0,  2]],
    4:  [[ 3,  0, -3,  2, -1], [-2,  1,  3,  0,  1], [ 0,  1,  2,  2, -1]],
    5:  [[-1,  2, -2, -2,  3], [ 0,  1,  2,  3, -2], [ 1,  0,  3,  1, -1]],
    6:  [[ 2,  1, -3, -1,  2], [-2, -1,  3,  3, -1], [-1,  0,  2,  3, -1]],
    7:  [[ 2,  2, -1,  0, -1], [-2,  3,  1,  0,  2], [ 0, -1,  3,  2, -2]],
    8:  [[ 2,  1, -2, -2,  2], [-1,  0,  3,  2,  1], [ 2, -1,  0,  3, -2]],
    9:  [[ 3,  1, -2,  0, -1], [-1,  0,  3,  2,  0], [-1,  3,  0,  1,  1]],
    10: [[-1,  2,  0, -2,  3], [ 1,  0, -1,  3, -2], [-1,  2,  2,  1,  0]],
    11: [[ 2,  0,  1,  2, -2], [ 0,  0,  3,  1, -2], [-1,  2,  0, -2,  3]],
    12: [[ 3, -1, -1,  1, -2], [-3,  2,  0, -1,  3], [ 1,  1,  2,  2, -1]],
    13: [[ 3, -1, -2,  2, -3], [-2,  1,  2,  0,  3], [-1, -2,  2,  3, -3]],
    14: [[ 3,  0, -2,  2, -2], [-2,  1,  2, -2,  3], [-1,  1,  3,  1, -1]],
    15: [[ 3,  0, -3,  1,  0], [ 1,  2, -1,  3, -1], [-2,  0,  3,  1,  1]],
    16: [[ 3,  2, -2,  0, -1], [-1,  2,  1,  3,  0], [-2,  1,  3,  1,  1]],
    17: [[ 3,  0, -2,  1, -2], [-3,  2,  0, -1,  3], [ 0,  0,  3,  2, -2]],
    18: [[ 3, -1, -2,  0, -1], [-1,  3,  0, -1,  2], [-1,  0,  3,  2, -1]],
    19: [[ 3, -1, -2,  2, -1], [-2,  2,  0,  2,  2], [-1,  2,  2,  1,  0]],
    20: [[ 3,  0, -1,  2, -3], [-1,  3,  0,  1,  2], [-1,  1,  2,  2,  1]],

    # ── 判断题（Q21–Q40，每题 A=是 / B=否）──────────────────────────────
    21: [[ 2,  0, -1, -2,  0], [-1,  0,  2,  2,  0]],
    22: [[-2,  1,  2,  1,  2], [ 2,  0, -2,  0, -1]],
    23: [[ 1,  3, -1,  1, -1], [-1, -2,  1,  0,  2]],
    24: [[ 0,  1,  1,  3, -1], [ 2, -1, -1, -3,  0]],
    25: [[-1,  1,  1,  3,  1], [ 2, -1, -1, -2,  0]],
    26: [[-2,  1,  1,  0,  3], [ 1,  0, -1,  2, -3]],
    27: [[ 2,  2, -2,  0, -1], [-1, -1,  2,  1,  1]],
    28: [[-3,  2,  2,  1,  1], [ 3, -1, -2,  0, -1]],
    29: [[-1,  3,  0, -2,  2], [ 1, -2,  1,  2, -1]],
    30: [[-2,  1,  1, -1,  3], [ 1,  0, -1,  2, -3]],
    31: [[-1,  2,  0,  3, -1], [ 2, -1, -1, -2,  0]],
    32: [[-2,  2,  2,  0,  1], [ 2, -1, -2,  2, -1]],
    33: [[ 0, -2,  3,  1,  1], [ 1,  3, -2,  0, -1]],
    34: [[ 2, -2,  2,  1,  0], [-1,  3, -1,  2,  1]],
    35: [[ 1,  0, -1,  3, -2], [-1,  1,  2, -2,  2]],
    36: [[-2,  0,  3,  1,  1], [ 3,  0, -3,  0, -1]],
    37: [[ 0,  1,  1,  3, -2], [-1,  2, -1, -3,  3]],
    38: [[ 3, -1, -2, -1, -1], [-2,  1,  2,  2,  1]],
    39: [[-3,  0,  3,  1,  1], [ 3,  0, -3,  0, -1]],
    40: [[-1,  1,  3, -2,  2], [ 1,  2, -2,  3, -1]],
}

text = QUESTIONS_JS.read_text(encoding="utf-8")
for qid, option_scores in NEW_SCORES.items():
    id_pattern = rf'\{{\s*\n\s*id:\s*{qid},'
    m_start = re.search(id_pattern, text)
    if not m_start:
        print(f"WARNING: Q{qid} id block not found")
        continue

    next_id = qid + 1
    m_end = re.search(rf'\{{\s*\n\s*id:\s*{next_id},', text[m_start.start():])
    if m_end:
        block_end = m_start.start() + m_end.start()
    else:
        block_end_m = re.search(r'\n\];', text[m_start.start():])
        block_end = m_start.start() + (block_end_m.start() if block_end_m else len(text) - m_start.start())

    block = text[m_start.start(): block_end]
    sc_pattern = re.compile(r'scoreChanges:\s*\[[^\]]*\]')
    matches = list(sc_pattern.finditer(block))
    if len(matches) != len(option_scores):
        print(f"WARNING: Q{qid} expected {len(option_scores)} scoreChanges, found {len(matches)}")
        continue

    new_block = block
    for match, scores in reversed(list(zip(matches, option_scores))):
        replacement = "scoreChanges: [" + ", ".join(str(s) for s in scores) + "]"
        new_block = new_block[:match.start()] + replacement + new_block[match.end():]

    text = text[:m_start.start()] + new_block + text[block_end:]

QUESTIONS_JS.write_text(text, encoding="utf-8", newline="\n")
print("Done. 40 questions updated.")

