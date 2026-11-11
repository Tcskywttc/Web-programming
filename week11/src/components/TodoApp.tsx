import { useCallback, useEffect, useRef, useState } from "react";
import {
  addTodo,
  clearCompleted,
  normalizeText,
  removeTodo,
  toggleTodo,
  updateTodo,
} from "../todo";
import type { Filter, Todo } from "../todo";
import { loadTodos } from "../storage";
import { useTodoPersistence } from "../hooks/useTodoPersistence";
import { useTodoDiagnostics } from "../hooks/useTodoDiagnostics";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "active", label: "未完成" },
  { value: "done", label: "已完成" },
];

export default function TodoApp() {
  const [initial] = useState(loadTodos);
  const [todos, setTodos] = useState<Todo[]>(initial.todos);
  const [filter, setFilter] = useState<Filter>("all");
  const [editMessage, setEditMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const storageMessage = useTodoPersistence(todos, initial);
  useTodoDiagnostics(todos);

  function handleAdd(text: string): boolean {
    if (normalizeText(text) === null) return false;
    setTodos((prev) => addTodo(prev, text));
    setEditMessage("");
    return true;
  }

  function handleToggle(id: number): void {
    if (import.meta.env.DEV) console.log("[toggle]", id);
    setTodos((prev) => toggleTodo(prev, id));
    setEditMessage("");
    if (filter !== "all") inputRef.current?.focus();
  }

  function handleDelete(id: number): void {
    if (import.meta.env.DEV) console.log("[delete]", id);
    setTodos((prev) => removeTodo(prev, id));
    setEditMessage("");
    inputRef.current?.focus();
  }

  function handleEdit(todo: Todo): void {
    const text = window.prompt("修改任务", todo.text);
    if (text === null) return;
    if (normalizeText(text) === null) {
      setEditMessage("请输入非空任务文字，且不要包含 script 标签。");
      return;
    }
    if (import.meta.env.DEV) console.log("[edit]", todo.id);
    setTodos((prev) => updateTodo(prev, todo.id, text));
    setEditMessage("");
  }

  const handleClear = useCallback(() => {
    setTodos((prev) => clearCompleted(prev));
    setEditMessage("");
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // 兼容 W10 的控制台清理入口，卸载时只移除自己的绑定。
    window.clearCompleted = handleClear;
    return () => {
      if (window.clearCompleted === handleClear) delete window.clearCompleted;
    };
  }, [handleClear]);

  const shown = todos.filter(
    (todo) => filter === "all" || (filter === "done" ? todo.completed : !todo.completed),
  );
  const done = todos.filter((todo) => todo.completed).length;

  return (
    <>
      <TodoForm onAdd={handleAdd} inputRef={inputRef} />
      <div className="todo-filters" role="group" aria-label="筛选待办事项">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            data-filter={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <p id="todo-summary" role="status">
        共 {todos.length} 项，已完成 {done} 项，未完成 {todos.length - done} 项
      </p>
      <p id="todo-storage-status" className="todo-storage-status" role="status">
        {[storageMessage, editMessage].filter(Boolean).join(" ")}
      </p>
      <TodoList
        todos={shown}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </>
  );
}
