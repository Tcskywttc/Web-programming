import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TodoApp from "./components/TodoApp";

const root = document.getElementById("todo-root");
if (root === null) throw new Error("Todo 挂载容器不存在。");
createRoot(root).render(
  <StrictMode>
    <TodoApp />
  </StrictMode>,
);
