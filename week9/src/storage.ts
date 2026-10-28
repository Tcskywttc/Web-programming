import { isTodoId, normalizeText } from "./todo";
import type { Todo } from "./todo";

export const STORAGE_KEY = "web-week9-todos";

export interface LoadResult {
  todos: Todo[];
  message: string;
}

function isTodo(value: unknown): value is Todo {
  return typeof value === "object" && value !== null &&
    "id" in value && isTodoId(value.id) &&
    "text" in value && typeof value.text === "string" &&
    normalizeText(value.text) === value.text &&
    "completed" in value && typeof value.completed === "boolean";
}

export function parseStoredTodos(value: unknown): Todo[] | null {
  if (!Array.isArray(value)) return null;
  const items: unknown[] = value;
  const todos: Todo[] = [];
  const ids = new Set<number>();
  // 显式收窄每个外部数据项，避免 JSON 解析结果直接充当 Todo[]。
  for (const item of items) {
    if (!isTodo(item) || ids.has(item.id)) return null;
    ids.add(item.id);
    todos.push({ id: item.id, text: item.text, completed: item.completed });
  }
  return todos;
}

export function loadTodos(): LoadResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { todos: [], message: "" };
    const parsed: unknown = JSON.parse(raw);
    const todos = parseStoredTodos(parsed);
    if (todos === null) throw new Error("Invalid todo data");
    return { todos, message: "" };
  } catch {
    return {
      todos: [],
      message: "无法恢复已存任务，暂显示空列表；原存储未改动，新增任务后会尝试覆盖保存。",
    };
  }
}

export function saveTodos(todos: Todo[]): string {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    return "";
  } catch {
    return "当前更改仅保留在此页面，无法保存；刷新后可能丢失。";
  }
}
