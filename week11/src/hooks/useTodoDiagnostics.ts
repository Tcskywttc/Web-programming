import { useEffect } from "react";
import type { Todo } from "../todo";

declare global {
  interface Window {
    getTodos?: () => Todo[];
    clearCompleted?: () => void;
  }
}

export function useTodoDiagnostics(todos: Todo[]): void {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    // 打印已提交状态的字符串快照，避免控制台展开对象时显示后来的值。
    console.log("[todos]", JSON.stringify(todos));
    const readSnapshot = () => todos.map((todo) => ({ ...todo }));
    window.getTodos = readSnapshot;
    return () => {
      if (window.getTodos === readSnapshot) delete window.getTodos;
    };
  }, [todos]);
}
