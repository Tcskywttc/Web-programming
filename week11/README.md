# W11：React Todo V4.0

在 W10 的 Vite + TypeScript 工程上迁移 Todo，保留个人作品集页面、原有业务函数和全部 13 条回归测试。任务状态由 React 管理，列表不再手工操作 DOM。

## 运行

需要 Node.js 22.22.2+（22 系列）、24.15.0+（24 系列）或 26+，与 jsdom 31 的要求一致；本次验证使用 26.0.0。在本目录运行：

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:8011/#todo 。编辑使用原生 prompt，推荐普通 Chrome。8011 与 W10 的 8010 为不同源，localStorage 不会自动跨端口迁移；仍使用 web-week9-todos 键及原数据格式。

## 验证

```sh
npm run test
npm run build
npm run lint
npm run lint:summary
npm run lint:task3
npm run format:check
```

测试为 5 个文件、24 条：原有 13 条业务测试，新增 10 条 React 交互/存储测试，以及 1 条独立“假 React”修复稿验证。新增测试由 Codex 辅助编写，原有两份本人测试保持字节一致。

## 组件与状态

- TodoApp：任务数组、筛选条件、编辑提示、事件回调和统计。
- TodoForm：受控输入、输入校验提示、回车与中文输入法保护。
- TodoList：筛选结果及空状态；以任务 ID 为 key。
- TodoItem：显示单项，回调完成、编辑、删除；不修改 Props。
- useTodoPersistence：只在有效任务状态变化后保存。首次挂载不写回，保护损坏的原始存储；保存失败后保留 UI，并在下次有效操作时重试。
- useTodoDiagnostics：开发环境打印提交后的 JSON 状态快照，并提供 window.getTodos()，返回副本供截图核对。

增删改统一采用 setTodos(prev => 业务函数(prev, ...))。更新器只返回数据，不写存储、不打印日志、不操作 DOM。window.clearCompleted() 保留原有控制台入口，卸载时清理自己的绑定。

控制台查看状态：

```js
console.table(window.getTodos())
JSON.stringify(window.getTodos())
```

需等待点击后的界面更新完成再读取。生产构建不提供 getTodos，也不输出调试日志。StrictMode 在开发环境可能让初始快照打印两次，这不表示重复添加。

## 行为契约

文本去首尾空白，拒绝空串、纯空白和约定的 script 标签，允许 scripture 等相似合法文字。重复文本允许，ID 为唯一正安全整数。添加/编辑规则一致，有效修改生成新数组和必要的新对象；无效操作返回原引用。React 通过文本插值展示任务，不解释用户输入为 HTML。

编辑/删除与切换互斥；取消编辑不修改数据。保留筛选、统计、持久化、键盘操作、行空白点击和焦点恢复。

## 课程任务 3 与协作日志

`evidence/week11/task3/original.tsx.txt` 为教师提供的原始靶子，`prompt.txt` 为审查提示，`ai-repair.tsx` 为修复稿。修复稿由独立测试验证，不挂载到正式页面。原始靶子中保留 DOM 操作用于教学审查；正式源码 `src` 中只有 `main.tsx` 查找 React 挂载容器。

本目录提供可运行、可测试的 W11 工程。含运行截图、行为验证和本人审查结论的 AI 协作日志另行提交给老师；原始截图与自动生成的验证输出不随最小工程上传。
