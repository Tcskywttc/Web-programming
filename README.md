# Web编程

第 7 周：在 W6 个人作品集的 Todo 基础上实现数据驱动重构。

## 运行

在仓库目录运行 `python3 -m http.server 8000`，浏览器打开 `http://localhost:8000/#todo`。使用 localhost 或 HTTPS（任务 ID 使用 crypto.randomUUID）。

- 添加、点击任务切换完成、删除；支持 Enter 和键盘聚焦。
- 全部 / 未完成 / 已完成筛选；刷新恢复任务，筛选回到全部。
- 控制台执行 `clearCompleted()` 清除全部已完成任务。
- 任务存在当前浏览器、当前站点的 localStorage，键名为 `web-week7-todos`。不跨浏览器或设备同步。
- 存储无效时显示提示并暂用空列表；初次读取不覆盖原值，后续任务操作会尝试保存。存储不可写时明确提示更改只保留在当前页面。

## 数据流

`addTodo / removeTodo / toggleTodo / clearCompleted` 更新 todos → save → render。
添加用展开，删除/清除用 filter，完成切换用 map 和对象展开。render 使用 textContent 生成列表，筛选只改变视图。

## Git 过程

先保存 W6 可运行基线，然后在 `feature/v2-data-driven` 上依次完成：

1. 647abca：数据驱动和不可变操作。
2. 535eed4：存储容错与重绘焦点修复。
3. 7d3a73a：筛选、计数、clearCompleted 和回归证据。

7702c78 是合并回 main 的双亲 merge commit；后续文档提交补充报告和验证说明。

## 验证及协作日志

本机 Chrome 155.0.8059.39 的 43 项检查通过，见 `evidence/results.json`；含 320、375、800、1440px 布局、不可变引用、刷新、坏存储、键盘交互和旧文件保护。结果不代表所有浏览器。

复测需 Node.js、Playwright 和已安装的 Chrome：`npm install --no-save playwright`，然后 `node evidence/verify.cjs`。从独立仓库运行时跳过相邻 W6 基线对比，共 37 项；课程目录中有 W6 时为 43 项。浏览器测试使用独立上下文，不改个人浏览器存储。

`evidence/review.cjs` 可记录当前版本的焦点和坏存储表现；历史 before 结果对应提交 647abca，当时尚未修复。初版脚本留存在 `evidence/script.phase1.js`。

DOCX 按教师模板填写原有空处；核心代码采用文字，截图留在 evidence。clearCompleted 与 5 问按用户要求由 AI 辅助完成，报告中明确说明，不记为禁用 AI 的独立练习。freeCodeCamp 平台练习不包含在本仓库的完成证明中。
