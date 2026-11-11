import { useEffect, useRef, useState } from "react";
import { saveTodos } from "../storage";
import type { LoadResult } from "../storage";
import type { Todo } from "../todo";

export function useTodoPersistence(todos: Todo[], initial: LoadResult): string {
  const [message, setMessage] = useState(initial.message);
  const previous = useRef(initial.todos);

  useEffect(() => {
    // 初次挂载（包括 StrictMode 重放）不写回，保护无法解析的原始存储。
    // 无效操作返回同一数组，也不触发保存；下次有效修改会重试失败的保存。
    if (previous.current === todos) return;
    previous.current = todos;
    setMessage(saveTodos(todos));
  }, [todos]);

  return message;
}
