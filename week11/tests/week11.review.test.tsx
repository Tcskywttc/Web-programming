import { StrictMode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import RepairedTodoApp from "../evidence/week11/task3/ai-repair";

afterEach(cleanup);

test("任务3：修复稿拒绝空白，连续添加和其他 State 更新后没有额外 DOM", () => {
  render(
    <StrictMode>
      <RepairedTodoApp />
    </StrictMode>,
  );
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "   " } });
  fireEvent.click(screen.getByText("添加"));
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  for (const text of ["任务A", "任务B"]) {
    fireEvent.change(input, { target: { value: text } });
    fireEvent.click(screen.getByText("添加"));
    expect((input as HTMLInputElement).value).toBe("");
  }
  fireEvent.change(input, { target: { value: "仅改变输入状态" } });
  expect(screen.getAllByRole("listitem").map((item) => item.textContent?.trim())).toEqual(
    ["任务A", "任务B"],
  );
  fireEvent.click(screen.getByRole("button", { name: "任务A" }));
  expect(
    screen.getByRole("button", { name: "任务A ✔" }).getAttribute("aria-pressed"),
  ).toBe("true");
  expect(screen.getByRole("button", { name: "任务B" }).getAttribute("aria-pressed")).toBe(
    "false",
  );
});
