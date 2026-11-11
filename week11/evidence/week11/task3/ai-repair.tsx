// 教师靶子代码的独立修复稿，不挂载到正式页面。
import { useState } from "react";
import { addTodo, normalizeText, toggleTodo } from "../../../src/todo";
import type { Todo } from "../../../src/todo";

export default function RepairedTodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");

  function handleAdd(): void {
    if (normalizeText(text) === null) return;
    setTodos((prev) => addTodo(prev, text));
    setText("");
  }

  function handleToggle(id: number): void {
    setTodos((prev) => toggleTodo(prev, id));
  }

  return (
    <div>
      <input
        aria-label="任务文字"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button onClick={handleAdd}>添加</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <button aria-pressed={todo.completed} onClick={() => handleToggle(todo.id)}>
              {todo.text} {todo.completed ? "✔" : ""}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
