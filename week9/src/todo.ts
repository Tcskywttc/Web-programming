// 本周的数据逻辑由 AI 辅助实现；课堂要求的手写测试由学生独立编写。
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export type Filter = "all" | "done" | "active";

export function isFilter(value: unknown): value is Filter {
  return value === "all" || value === "done" || value === "active";
}

export function isTodoId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

// dataset 的字符串必须先检查空白，再转换，避免空串被 Number 转为 0。
export function parseTodoId(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  const id = Number(raw);
  return isTodoId(id) ? id : null;
}

export function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  // 业务规则：拒绝 script 开/闭标签（忽略大小写，允许标签前空白）。
  // 这不是通用 HTML 净化器；页面仍须通过 textContent 输出。
  if (text === "" || /<\s*\/?\s*script(?:\s|\/|>|$)/i.test(text)) return null;
  return text;
}

function nextTodoId(todos: Todo[]): number {
  const maxId = todos.reduce((max, todo) => Math.max(max, todo.id), 0);
  if (maxId < Number.MAX_SAFE_INTEGER) return maxId + 1;
  // 达到上限时从 1 查找空闲 ID，不产生溢出或重复 ID。
  const used = new Set(todos.map(todo => todo.id));
  let candidate = 1;
  while (used.has(candidate)) candidate += 1;
  return candidate;
}

// 数据函数只处理任务数组；无效操作返回原数组，有效操作不修改旧数据。
export function addTodo(todos: Todo[], text: unknown): Todo[] {
  const cleaned = normalizeText(text);
  if (cleaned === null) return todos;
  return [...todos, { id: nextTodoId(todos), text: cleaned, completed: false }];
}

export function toggleTodo(todos: Todo[], id: number): Todo[] {
  if (!isTodoId(id) || !todos.some(todo => todo.id === id)) return todos;
  return todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
}

export function removeTodo(todos: Todo[], id: number): Todo[] {
  if (!isTodoId(id) || !todos.some(todo => todo.id === id)) return todos;
  return todos.filter(todo => todo.id !== id);
}

export function updateTodo(todos: Todo[], id: number, text: unknown): Todo[] {
  const cleaned = normalizeText(text);
  if (!isTodoId(id) || cleaned === null ||
      !todos.some(todo => todo.id === id && todo.text !== cleaned)) return todos;
  return todos.map(todo => todo.id === id ? { ...todo, text: cleaned } : todo);
}

export function clearCompleted(todos: Todo[]): Todo[] {
  if (!todos.some(todo => todo.completed)) return todos;
  return todos.filter(todo => !todo.completed);
}
