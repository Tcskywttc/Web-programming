import type { Todo } from "../todo";
import TodoItem from "./TodoItem";

export interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
}

export default function TodoList({ todos, onToggle, onDelete, onEdit }: TodoListProps) {
  return (
    <>
      {todos.length === 0 && <p id="todo-empty">当前没有待办事项。</p>}
      <ul id="todo-list" className="todo-list" aria-label="待办事项列表">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </ul>
    </>
  );
}
