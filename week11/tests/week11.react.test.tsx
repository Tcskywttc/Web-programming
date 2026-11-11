import { StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import TodoApp from "../src/components/TodoApp";
import { STORAGE_KEY } from "../src/storage";

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function setup() {
  const view = render(
    <StrictMode>
      <TodoApp />
    </StrictMode>,
  );
  return {
    ...view,
    user: userEvent.setup(),
    input: screen.getByRole("textbox", { name: "新的待办事项" }),
  };
}

function add(text: string): void {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "添加" }));
}

test("React 添加、切换、删除同步 State、统计与存储，并恢复输入焦点", async () => {
  const { user, input } = setup();
  await user.type(input, "  任务A  ");
  await user.click(screen.getByRole("button", { name: "添加" }));
  expect((input as HTMLInputElement).value).toBe("");
  expect(document.activeElement).toBe(input);
  expect(window.getTodos?.()).toEqual([{ id: 1, text: "任务A", completed: false }]);
  await user.click(screen.getByRole("button", { name: "任务A" }));
  expect(screen.getByRole("button", { name: "任务A" }).getAttribute("aria-pressed")).toBe(
    "true",
  );
  expect(screen.getByRole("listitem").classList.contains("done")).toBe(true);
  expect(screen.getByText("共 1 项，已完成 1 项，未完成 0 项")).toBeTruthy();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")).toEqual(
    window.getTodos?.(),
  );
  // 点击删除按钮内部 span，不能落入行切换处理。
  await user.click(
    within(screen.getByRole("button", { name: "删除：任务A" })).getByText("删除"),
  );
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  expect(window.getTodos?.()).toEqual([]);
  expect(document.activeElement).toBe(input);
  expect(console.log).toHaveBeenCalledWith("[toggle]", 1);
  expect(
    vi.mocked(console.log).mock.calls.filter(([name]) => name === "[toggle]"),
  ).toHaveLength(1);
});

test("纯空白与 script 被拒绝且保留输入，合法相似文本按文本渲染", () => {
  const { input } = setup();
  add("已有任务");
  for (const text of ["   ", "<script>x</script>"]) {
    add(text);
    expect((input as HTMLInputElement).value).toBe(text);
    expect(screen.getByText("请输入非空任务文字，且不要包含 script 标签。")).toBeTruthy();
    expect(window.getTodos?.()).toHaveLength(1);
  }
  add("<scripture>");
  expect(screen.getByRole("button", { name: "<scripture>" }).textContent).toBe(
    "<scripture>",
  );
  expect(window.getTodos?.()).toHaveLength(2);
});

test("同一批事件连续添加保留两项，筛选重渲染不会残留或重复 DOM", () => {
  setup();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "任务A" } });
  act(() => {
    screen.getByRole("button", { name: "添加" }).click();
    screen.getByRole("button", { name: "添加" }).click();
  });
  expect(window.getTodos?.().map((todo) => todo.id)).toEqual([1, 2]);
  fireEvent.click(screen.getByRole("button", { name: "已完成" }));
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "全部" }));
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});

test("编辑 trim、取消与无效编辑保持完成状态；删除不影响其他任务", () => {
  setup();
  add("任务A");
  add("任务B");
  fireEvent.click(screen.getByRole("button", { name: "任务A" }));
  const prompt = vi.spyOn(window, "prompt").mockReturnValue("  修改A  ");
  fireEvent.click(screen.getByRole("button", { name: "编辑：任务A" }));
  expect(window.getTodos?.()[0]).toEqual({ id: 1, text: "修改A", completed: true });
  for (const text of [null, "   ", "<script>bad</script>"]) {
    prompt.mockReturnValue(text);
    fireEvent.click(screen.getByRole("button", { name: "编辑：修改A" }));
    expect(window.getTodos?.()[0]).toEqual({ id: 1, text: "修改A", completed: true });
  }
  fireEvent.click(screen.getByRole("button", { name: "删除：任务B" }));
  expect(window.getTodos?.()).toEqual([{ id: 1, text: "修改A", completed: true }]);
});

test("筛选后切换使任务离开当前列表，焦点回到输入框且统计仍基于全部任务", () => {
  const { input } = setup();
  add("任务A");
  add("任务B");
  fireEvent.click(screen.getByRole("button", { name: "未完成" }));
  fireEvent.click(screen.getByRole("button", { name: "任务A" }));
  expect(screen.queryByRole("button", { name: "任务A" })).toBeNull();
  expect(screen.getByText("共 2 项，已完成 1 项，未完成 1 项")).toBeTruthy();
  expect(document.activeElement).toBe(input);
  fireEvent.click(screen.getByRole("button", { name: "已完成" }));
  expect(screen.getByRole("button", { name: "任务A" })).toBeTruthy();
});

test("回车添加；输入法组合期间 Enter 不触发表单默认提交", async () => {
  const { user, input } = setup();
  await user.type(input, "任务A{Enter}");
  expect(window.getTodos?.()).toHaveLength(1);
  fireEvent.change(input, { target: { value: "中文候选" } });
  const event = new KeyboardEvent("keydown", {
    key: "Enter",
    isComposing: true,
    bubbles: true,
    cancelable: true,
  });
  fireEvent(input, event);
  expect(event.defaultPrevented).toBe(true);
  expect(window.getTodos?.()).toHaveLength(1);
  expect((input as HTMLInputElement).value).toBe("中文候选");
});

test("加载旧格式且初次挂载不保存，有效修改可在重新挂载后恢复", () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([{ id: 7, text: "旧任务", completed: true }]),
  );
  const save = vi.spyOn(Storage.prototype, "setItem");
  const view = setup();
  expect(save).not.toHaveBeenCalled();
  add("新任务");
  expect(save).toHaveBeenCalledTimes(1);
  view.unmount();
  setup();
  expect(window.getTodos?.()).toEqual([
    { id: 7, text: "旧任务", completed: true },
    { id: 8, text: "新任务", completed: false },
  ]);
});

test("损坏存储在 StrictMode 初始化、筛选和无效提交后保持原文，有效添加才覆盖", () => {
  localStorage.setItem(STORAGE_KEY, "{broken-json");
  const save = vi.spyOn(Storage.prototype, "setItem");
  setup();
  expect(screen.getByText(/无法恢复已存任务/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "已完成" }));
  add("  ");
  expect(localStorage.getItem(STORAGE_KEY)).toBe("{broken-json");
  expect(save).not.toHaveBeenCalled();
  add("有效任务");
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")).toEqual([
    { id: 1, text: "有效任务", completed: false },
  ]);
  expect(screen.queryByText(/无法恢复已存任务/)).toBeNull();
});

test("保存失败保留当前 UI 与提示，下次有效修改重试成功后清除提示", () => {
  setup();
  const save = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("quota");
  });
  add("任务A");
  expect(screen.getByRole("button", { name: "任务A" })).toBeTruthy();
  expect(screen.getByText(/当前更改仅保留在此页面/)).toBeTruthy();
  save.mockRestore();
  fireEvent.click(screen.getByRole("button", { name: "任务A" }));
  expect(screen.queryByText(/当前更改仅保留在此页面/)).toBeNull();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")[0].completed).toBe(true);
});

test("控制台快照不能修改 State，清理完成项入口正确且卸载清理绑定", () => {
  const view = setup();
  add("任务A");
  add("任务B");
  const snapshot = window.getTodos?.();
  expect(snapshot).toBeDefined();
  if (snapshot) snapshot[0].text = "外部修改";
  expect(window.getTodos?.()[0].text).toBe("任务A");
  fireEvent.click(screen.getByRole("button", { name: "任务A" }));
  act(() => window.clearCompleted?.());
  expect(window.getTodos?.()).toEqual([{ id: 2, text: "任务B", completed: false }]);
  view.unmount();
  expect(window.getTodos).toBeUndefined();
  expect(window.clearCompleted).toBeUndefined();
});
