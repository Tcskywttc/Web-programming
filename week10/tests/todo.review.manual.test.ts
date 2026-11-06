import { test, expect } from "vitest";
import { addTodo } from "../src/todo";
import type { Todo } from "../src/todo";

// 维度：越界——已有 ID 达到最大安全整数。
test("ID 达到上限时，仍分配安全且不重复的新 ID", () => {
  const todos: Todo[] = [
    { id: 1, text: "已有任务", completed: false },
    {
      id: Number.MAX_SAFE_INTEGER,
      text: "上限任务",
      completed: true,
    },
  ];

  const result = addTodo(todos, "边界任务");

  expect(result).not.toBe(todos);
  expect(result).toHaveLength(3);
  expect(result.slice(0, 2)).toEqual([
    { id: 1, text: "已有任务", completed: false },
    {
      id: Number.MAX_SAFE_INTEGER,
      text: "上限任务",
      completed: true,
    },
  ]);
  expect(result[2].text).toBe("边界任务");
  expect(result[2].completed).toBe(false);
  expect(Number.isSafeInteger(result[2].id)).toBe(true);
  expect(result[2].id).toBeGreaterThan(0);
  expect([1, Number.MAX_SAFE_INTEGER]).not.toContain(result[2].id);

  expect(todos).toEqual([
    { id: 1, text: "已有任务", completed: false },
    {
      id: Number.MAX_SAFE_INTEGER,
      text: "上限任务",
      completed: true,
    },
  ]);
});

// 维度：安全——不误拒绝与 script 标签相似的合法文本。
test("允许 scripture 文本，不因包含 script 就拒绝", () => {
  const todos: Todo[] = [];

  const result = addTodo(todos, "<scripture>");

  expect(result).not.toBe(todos);
  expect(result).toHaveLength(1);
  expect(result[0].text).toBe("<scripture>");
  expect(result[0].completed).toBe(false);
  expect(Number.isSafeInteger(result[0].id)).toBe(true);
  expect(result[0].id).toBeGreaterThan(0);
  expect(todos).toEqual([]);
});
