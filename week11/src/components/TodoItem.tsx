import type { Todo } from "../todo";

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  return (
    <li
      className={todo.completed ? "todo-item done" : "todo-item"}
      data-id={todo.id}
      onClick={(event) => {
        // 保留点击行空白切换；按钮各自处理，冒泡不重复执行。
        if (event.target === event.currentTarget) onToggle(todo.id);
      }}
    >
      <button
        type="button"
        className="todo-toggle"
        aria-pressed={todo.completed}
        onClick={() => onToggle(todo.id)}
      >
        {todo.text}
      </button>
      <button
        type="button"
        className="todo-edit"
        aria-label={`编辑：${todo.text}`}
        onClick={() => onEdit(todo)}
      >
        编辑
      </button>
      <button
        type="button"
        className="todo-delete"
        aria-label={`删除：${todo.text}`}
        onClick={() => onDelete(todo.id)}
      >
        <span>删除</span>
      </button>
    </li>
  );
}
