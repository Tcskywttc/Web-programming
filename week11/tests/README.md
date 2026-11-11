# W11 测试来源

`to.test.ts`（5 条）与 `todo.review.manual.test.ts`（2 条）逐字继承 W9 用户原稿。`week10.regression.test.ts`（6 条）由 Codex 在 W10 新增。

W11 原样保留以上 13 条。新增 `week11.react.test.tsx` 的 10 条 React 交互与存储回归，以及 `week11.review.test.tsx` 的 1 条靶子修复稿测试，均由 Codex 辅助编写。执行 `npm run test` 运行全部 5 个文件、24 条用例。

Vitest 的 logic 项目在 Node 环境运行原有业务测试；react 项目在 jsdom 环境运行 TSX 测试。两类均由同一个 test 命令发现，不跳过原有断言。新测试覆盖用户行为和状态/存储结果，不以快照数量代替业务断言。
