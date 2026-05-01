# data-build tools

该目录用于存放前端运行时之外的数据构建脚本（如题库转换、分数批处理）。

已迁移脚本：

- `build_questions.py`：批量重写 `src/data/screenplays/yongzheng/questions.js` 的 `scoreChanges`。

使用方式（项目根目录）：

- `python tools/data-build/build_questions.py`

兼容入口：

- 已移除 `js/build_questions.py`，请统一使用新路径入口。

