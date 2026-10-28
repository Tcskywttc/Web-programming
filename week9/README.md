# Week 9：TypeScript 重构与单元测试

本目录是 Week9 提交。仓库根目录保留 Week8 的页面与代码。

## 运行与验收

使用符合 `package.json` 中 `engines.node` 要求的 Node.js（例如 Node.js 26）。在仓库根目录执行：

```sh
cd week9
npm ci
npm run test
npm run typecheck
npm run build
npm run dev
```

开发服务启动后访问 http://localhost:8009/#todo 。`npm run build` 只生成构建文件，不启动网页服务。

## 提交内容

- `src/todo.ts`：Todo 类型、文本与数字 ID 运行时校验、不可变的数据操作。
- `src/storage.ts`：本地存储解析与运行时校验，使用独立的 Week9 存储键。
- `src/main.ts`：DOM 类型收窄、事件委托及页面交互。
- `tests/to.test.ts`：本人手写的 5 条基础测试。
- `tests/todo.review.manual.test.ts`：本人补充的 2 条边界测试，覆盖最大安全整数 ID 与合法相似文本 `<scripture>`。
- `index.html`、`style.css`、`public/`：页面与必要资源。

业务函数返回结果数组，调用方需接收返回值；有效操作不修改原数组，无效操作返回原数组。合法文本 trim 后添加且初始未完成；拒绝空文本、纯空白、非字符串及约定的 script 标签，允许重复文本且 ID 不同，不限制文本长度。

## AI 协作边界

TypeScript 重构、工程配置及本说明由 Codex 辅助完成。5 条基础测试由本人关闭 AI 生成与补全后编写；2 条边界测试由本人提供，Codex 辅助加入导入语句。任务 3 的 Prompt、AI 第一版核心代码、本人审查和修补说明，以及测试截图，随协作日志单独提交。

执行 `npm run test` 会运行上述 7 条测试。AI 第一版不计入本目录的手写测试数量。
