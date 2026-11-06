# Week10 Todo 工程

基于 Vite 与 TypeScript，支持任务添加、编辑、删除、筛选及本地存储。

## 运行

使用符合 `package.json` 中 `engines` 要求的 Node.js，在本目录执行：

```sh
npm ci
npm run dev
```

访问 http://127.0.0.1:8010/#todo 。

## 检查

```sh
npm run lint
npm run test
npm run build
npm run format:check
```

- `build`：`tsc --noEmit && vite build`。
- `test`：`vitest run`，共 13 条测试。
- TypeScript 开启 `strict: true`。
- ESLint 使用 `.eslintrc.cjs`，complexity 上限 10、max-depth 上限 3、禁止显式 any；warning 上限 3。
- 环境文件由 `.gitignore` 排除，保留不含秘密的 `.env.example`。

构建输出在 `dist/`，使用 `npm run preview` 预览。
