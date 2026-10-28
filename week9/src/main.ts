import { addTodo, clearCompleted, isFilter, normalizeText, parseTodoId,
  removeTodo, toggleTodo, updateTodo } from "./todo";
import type { Filter, Todo } from "./todo";
import { loadTodos, saveTodos } from "./storage";

interface TodoElements {
  list: HTMLUListElement;
  input: HTMLInputElement;
  addButton: HTMLButtonElement;
  summary: HTMLElement;
  empty: HTMLElement;
  status: HTMLElement;
}

declare global {
  interface Window {
    clearCompleted?: () => void;
  }
}

function getElements(): TodoElements | null {
  const list = document.getElementById("todo-list");
  const input = document.getElementById("todo-input");
  const addButton = document.getElementById("todo-add-btn");
  const summary = document.getElementById("todo-summary");
  const empty = document.getElementById("todo-empty");
  const status = document.getElementById("todo-storage-status");
  if (!(list instanceof HTMLUListElement) || !(input instanceof HTMLInputElement) ||
      !(addButton instanceof HTMLButtonElement) || !(summary instanceof HTMLElement) ||
      !(empty instanceof HTMLElement) || !(status instanceof HTMLElement)) return null;
  return { list, input, addButton, summary, empty, status };
}

function startTodo(elements: TodoElements): void {
  const { list, input, addButton, summary, empty, status } = elements;
  const loaded = loadTodos();
  let todos: Todo[] = loaded.todos;
  let storageMessage = loaded.message;
  let inputMessage = "";
  let filter: Filter = "all";
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"))
    .filter((element): element is HTMLButtonElement => element instanceof HTMLButtonElement);

  function showStatus(): void {
    status.textContent = [storageMessage, inputMessage].filter(Boolean).join(" ");
  }

  function render(): void {
    const active = document.activeElement;
    const focusedId = active instanceof HTMLElement && list.contains(active)
      ? active.closest("li")?.dataset.id : undefined;
    const focusedAction = active instanceof HTMLElement ? active.dataset.action : undefined;
    list.replaceChildren();

    const shown = todos.filter(todo => filter === "all" ||
      (filter === "done" ? todo.completed : !todo.completed));
    for (const { id, text, completed } of shown) {
      const item = document.createElement("li");
      item.dataset.id = String(id);
      item.className = completed ? "todo-item done" : "todo-item";

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "todo-toggle";
      toggle.dataset.action = "toggle";
      toggle.textContent = text;
      toggle.setAttribute("aria-pressed", String(completed));

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "todo-edit";
      edit.dataset.action = "edit";
      edit.textContent = "编辑";
      edit.setAttribute("aria-label", `编辑：${text}`);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "todo-delete";
      remove.dataset.action = "delete";
      const label = document.createElement("span");
      label.textContent = "删除";
      remove.appendChild(label);
      remove.setAttribute("aria-label", `删除：${text}`);
      item.append(toggle, edit, remove);
      list.appendChild(item);
    }

    const done = todos.filter(todo => todo.completed).length;
    summary.textContent = `共 ${todos.length} 项，已完成 ${done} 项，未完成 ${todos.length - done} 项`;
    empty.hidden = shown.length > 0;
    for (const button of filterButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    }
    showStatus();

    if (focusedId !== undefined) {
      const row = Array.from(list.children).find(element =>
        element instanceof HTMLLIElement && element.dataset.id === focusedId);
      const button = row && Array.from(row.children).find(element =>
        element instanceof HTMLButtonElement && element.dataset.action === focusedAction);
      if (button instanceof HTMLButtonElement) button.focus();
      else input.focus();
    }
  }

  function commit(next: Todo[]): void {
    if (next === todos) return;
    todos = next;
    storageMessage = saveTodos(todos);
    inputMessage = "";
    render();
  }

  function showInvalidText(): void {
    inputMessage = "请输入非空任务文字，且不要包含 script 标签。";
    showStatus();
  }

  function handleListClick(event: MouseEvent): void {
    if (!(event.target instanceof Element)) return;
    const item = event.target.closest("li");
    if (!(item instanceof HTMLLIElement) || item.parentElement !== list) return;
    const id = parseTodoId(item.dataset.id);
    if (id === null) return;
    const todo = todos.find(entry => entry.id === id);
    if (todo === undefined) return;
    const actionElement = event.target.closest("[data-action]");
    if (actionElement !== null &&
        (!(actionElement instanceof HTMLButtonElement) || !item.contains(actionElement))) return;
    const action = actionElement?.dataset.action;

    if (action === "delete") {
      if (import.meta.env.DEV) console.log("[delete]", id);
      commit(removeTodo(todos, id));
      return;
    }
    if (action === "edit") {
      const text = window.prompt("修改任务", todo.text);
      if (text === null) return;
      if (normalizeText(text) === null) {
        showInvalidText();
        return;
      }
      if (import.meta.env.DEV) console.log("[edit]", id);
      commit(updateTodo(todos, id, text));
      return;
    }
    if (actionElement === null || action === "toggle") {
      if (import.meta.env.DEV) console.log("[toggle]", id);
      commit(toggleTodo(todos, id));
    }
  }

  function submit(): void {
    const next = addTodo(todos, input.value);
    if (next === todos) {
      showInvalidText();
      return;
    }
    commit(next);
    input.value = "";
    input.focus();
  }

  // 监听器只在初始化时注册；render 不给每个任务重复绑定监听器。
  list.addEventListener("click", handleListClick);
  addButton.addEventListener("click", submit);
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.isComposing) submit();
  });
  input.addEventListener("input", () => {
    inputMessage = "";
    showStatus();
  });
  for (const button of filterButtons) {
    button.addEventListener("click", () => {
      const value = button.dataset.filter;
      if (!isFilter(value)) return;
      filter = value;
      render();
    });
  }
  window.clearCompleted = () => commit(clearCompleted(todos));
  render();
}

const elements = getElements();
if (elements === null) console.warn("Todo 初始化失败：必要元素缺失或类型不正确。");
else startTodo(elements);
