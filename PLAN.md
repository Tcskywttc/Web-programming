# W7 数据驱动 Todo 实施计划

状态：代码已实施，43 项检查通过，功能分支已合并 main。

## 1. 已核实的现状

- W6 的 `index.html` 已包含输入框、添加按钮和空列表，`script.js` 使用 IIFE 隔离作用域，检查元素、trim 输入、createElement/appendChild 添加任务，并清空输入和返回焦点。
- W6 没有 todos 数组、删除、完成切换、筛选及 localStorage 持久化。

## 2. 目标、范围与实现方式

从 W6 复制网页和所需头像/简历资源，形成独立 W7 页面。保留个人作品集内容和视觉风格，原生 JS 实现本周功能，不引入框架。W6 原文件保留。

采用一个 todos 数组保存任务状态；每个任务包含 id、text、completed。filter 只保存当前视图状态，初始为 all。列表内容只由 render() 生成，不从 DOM 反推状态。

- addTodo：用展开生成新数组；拦截空白输入。
- removeTodo：用 filter 生成新数组；删除按钮不连带触发完成切换。
- toggleTodo：用 map 和对象展开产生新数组及被修改任务的新对象，其他任务保持不变。
- 三个函数均遵循“更新 todos → save() → render()”；禁止 push/splice 和直接修改旧任务对象。
- render：按 all/done/active 筛选，再创建元素、设置文字与 done 类、绑定事件、挂载到列表；任务文本通过 textContent 输出。
- save/load：JSON 序列化保存和读取；初始化先 load 再 render。对坏 JSON、错误结构和存储异常做适度处理，明确无法持久保存的情况，不将保存失败写成成功。
- setFilter：只切换视图并 render，不删减 todos，不保存筛选状态；刷新回到 all。
- 保留输入清空及焦点体验；新增筛选按钮、删除按钮、完成样式和简洁计数，计数 reduce 指定初始值。支持键盘操作并检查窄屏长文本。
- ID 方案在实施时明确，验证快速连续添加不会误删/误切换其他任务。

不增加编辑、排序、拖拽、后端、账号或其他无关功能。

## 3. Git 工作流（先分支，再实现）

用户已确认新建公开仓库，并在 GitHub 提示不支持中文后确定地址名称为 Web-programming；只纳入本次项目及必要提交材料，不把整门课程资料默认上传。

1. 在 main 保留可运行的 W6 基线；现有远端有历史时先检查并保留历史，不重写。
2. 实现前创建 `feature/v2-data-driven`。
3. 按真实完成阶段提交，功能分支至少 3 次有意义提交，例如：
   - `refactor: use immutable todo state and centralized rendering`
   - `feat: persist todo state with localStorage`
   - `feat: add todo filters and completion summary`
   - 实际发生的修复及日志整理另行提交，禁止完成后人为拆分伪造开发过程。
4. 验证通过后以 `git merge --no-ff` 合并到 main，保留可识别的 merge commit 和功能分支。
5. 推送 main 与功能分支，检查仓库链接可访问、提交数量、提交内容和合并关系；保存真实 git log 图和提交哈希。

## 4. 验收标准

- 添加：普通文字、两端空白、空输入、纯空白、重复文本、HTML 字符串、连续添加；顺序正确、文本安全显示、输入清空。
- 删除：只删除目标；删除按钮不误触发 toggle；刷新后仍删除。
- 切换：只改变目标 completed；done 样式正确；刷新后保留状态。
- 不可变性：检查更新前后的引用与内容，确认原数组及原对象未被更改。
- 筛选：all/done/active 内容正确；筛选后仍能正确添加、删除和切换；刷新恢复 all 且不丢任务。
- 持久化：空存储、正常存储、损坏 JSON、错误结构、存储不可用；记录实际行为与局限。
- 页面：320/375/800/1440px 无横向溢出；键盘焦点可见；长任务文本能换行；原网页资源和布局未回归。
- Git：公开或教师可访问、功能分支、至少 3 次有意义提交、明确 main 合并记录。

## 5. 交付物

- W7 网页与资源、运行说明。
- W7 协作日志。
- evidence/ 内测试结果、截图、diff 和 Git 记录。
- 公开仓库链接、功能分支及 merge commit。

验证结果见 evidence/results.json；两项初版问题的对照见 review-before.json / review-after.json；merge commit 为 7702c78。
