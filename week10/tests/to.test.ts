import { test, expect } from "vitest";
import { addTodo, toggleTodo } from "../src/todo";
import type { Todo } from "../src/todo";

test("正常添加：文本正确，初始未完成，原数组不变", () => {
  const todos: Todo[] = [];

  // 本项目返回结果数组，不原地修改 todos。
  const result = addTodo(todos, "学习 TypeScript");

  expect(result).toHaveLength(1);
  expect(result[0].text).toBe("学习 TypeScript");
  expect(result[0].completed).toBe(false);
  expect(Number.isSafeInteger(result[0].id)).toBe(true);
  expect(result[0].id).toBeGreaterThan(0);
  expect(todos).toEqual([]);
});

test("纯空格：拒绝添加，保留已有任务", () => {
  const todos: Todo[] = [{ id: 1, text: "原有任务", completed: true }];

  const result = addTodo(todos, "   ");

  expect(result).toEqual([{ id: 1, text: "原有任务", completed: true }]);
  expect(todos).toEqual([{ id: 1, text: "原有任务", completed: true }]);
});

test("空字符串：拒绝添加，保留已有任务", () => {
  const todos: Todo[] = [{ id: 1, text: "待完成任务", completed: false }];

  const result = addTodo(todos, "");

  expect(result).toEqual([{ id: 1, text: "待完成任务", completed: false }]);
  expect(todos).toEqual([{ id: 1, text: "待完成任务", completed: false }]);
});

test("正常切换：只翻转目标状态，原数据和其他任务不变", () => {
  const todos: Todo[] = [
    { id: 1, text: "目标任务", completed: false },
    { id: 2, text: "其他任务", completed: true },
  ];

  const result = toggleTodo(todos, 1);

  expect(result).toEqual([
    { id: 1, text: "目标任务", completed: true },
    { id: 2, text: "其他任务", completed: true },
  ]);
  expect(todos).toEqual([
    { id: 1, text: "目标任务", completed: false },
    { id: 2, text: "其他任务", completed: true },
  ]);

  const toggledBack = toggleTodo(result, 1);
  expect(toggledBack).toEqual(todos);
  expect(result[0].completed).toBe(true);
});

test("不存在的 ID：正常返回，所有任务内容和状态不变", () => {
  const todos: Todo[] = [
    { id: 1, text: "第一项", completed: false },
    { id: 2, text: "第二项", completed: true },
  ];

  // 若调用抛异常，本用例会直接失败；还需验证具体数据没有被改变。
  const result = toggleTodo(todos, 999);

  expect(result).toEqual([
    { id: 1, text: "第一项", completed: false },
    { id: 2, text: "第二项", completed: true },
  ]);
  expect(todos).toEqual([
    { id: 1, text: "第一项", completed: false },
    { id: 2, text: "第二项", completed: true },
  ]);
});
