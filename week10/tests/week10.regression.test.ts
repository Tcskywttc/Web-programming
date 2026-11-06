import { expect, test } from "vitest";
import { addTodo, clearCompleted, removeTodo, updateTodo } from "../src/todo";
import { parseStoredTodos } from "../src/storage";
import type { Todo } from "../src/todo";

test("添加时去掉首尾空白，重复文本获得不同 ID", () => {
  const first = addTodo([], "  任务  ");
  const second = addTodo(first, "任务");
  expect(first).toEqual([{ id: 1, text: "任务", completed: false }]);
  expect(second).toHaveLength(2);
  expect(second[1].text).toBe("任务");
  expect(second[1].id).not.toBe(first[0].id);
});

test("编辑只更新目标文字并 trim，保留完成状态、其他任务和原数据", () => {
  const todos: Todo[] = [
    { id: 1, text: "目标", completed: true },
    { id: 2, text: "其他", completed: false },
  ];
  expect(updateTodo(todos, 1, "  新文字  ")).toEqual([
    { id: 1, text: "新文字", completed: true },
    { id: 2, text: "其他", completed: false },
  ]);
  expect(todos).toEqual([
    { id: 1, text: "目标", completed: true },
    { id: 2, text: "其他", completed: false },
  ]);
});

test("取消、纯空白、非法类型和不存在目标的编辑均不改原数组", () => {
  const todos: Todo[] = [{ id: 1, text: "目标", completed: true }];
  for (const text of [null, undefined, "", " \t\n ", 123, {}, []]) {
    expect(updateTodo(todos, 1, text)).toBe(todos);
    expect(addTodo(todos, text)).toBe(todos);
  }
  expect(updateTodo(todos, 999, "新文字")).toBe(todos);
  expect(todos).toEqual([{ id: 1, text: "目标", completed: true }]);
});

test("添加和编辑都拒绝 script 标签，但接受相似合法文本", () => {
  const todos: Todo[] = [{ id: 1, text: "原任务", completed: false }];
  for (const text of ["<script>x</script>", "</SCRIPT>", "< ScRiPt src=x>"]) {
    expect(addTodo(todos, text)).toBe(todos);
    expect(updateTodo(todos, 1, text)).toBe(todos);
  }
  expect(updateTodo(todos, 1, "<scripture>")[0].text).toBe("<scripture>");
});

test("删除和清理不切换其他任务、不修改原数据", () => {
  const todos: Todo[] = [
    { id: 1, text: "未完成", completed: false },
    { id: 2, text: "已完成", completed: true },
  ];
  expect(removeTodo(todos, 2)).toEqual([{ id: 1, text: "未完成", completed: false }]);
  expect(clearCompleted(todos)).toEqual([{ id: 1, text: "未完成", completed: false }]);
  expect(todos).toEqual([
    { id: 1, text: "未完成", completed: false },
    { id: 2, text: "已完成", completed: true },
  ]);
});

test("存储入口拒绝未规范化文本和重复 ID，合法数据可恢复", () => {
  const valid = [{ id: 1, text: "合法任务", completed: true }];
  expect(parseStoredTodos(valid)).toEqual(valid);
  expect(parseStoredTodos([...valid, ...valid])).toBeNull();
  expect(parseStoredTodos([{ id: 1, text: "   ", completed: false }])).toBeNull();
  expect(parseStoredTodos([{ id: 1, text: " 合法任务 ", completed: false }])).toBeNull();
  expect(parseStoredTodos([{ id: "1", text: "任务", completed: false }])).toBeNull();
});
