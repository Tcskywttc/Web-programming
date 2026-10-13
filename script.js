"use strict";

// 单一任务状态；filter 在下一步加入，只控制显示哪些任务。
const KEY = "web-week7-todos";
const list = document.getElementById("todo-list");
const input = document.getElementById("todo-input");
const addBtn = document.getElementById("todo-add-btn");
let todos = load();

function save() {
  localStorage.setItem(KEY, JSON.stringify(todos));
}

function load() {
  const raw = localStorage.getItem(KEY);
  return raw === null ? [] : JSON.parse(raw);
}

function addTodo(text) {
  const cleaned = text.trim();
  if (!cleaned) return;
  // UUID 避免同一毫秒连续添加时 Date.now() 重复。
  todos = [...todos, { id: crypto.randomUUID(), text: cleaned, completed: false }];
  save();
  render();
}

function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function toggleTodo(id) {
  todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  save();
  render();
}

function render() {
  list.replaceChildren();
  todos.forEach(({ id, text, completed }) => {
    const li = document.createElement("li");
    li.dataset.id = id;
    li.className = completed ? "todo-item done" : "todo-item";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "todo-toggle";
    toggle.textContent = text;
    toggle.setAttribute("aria-pressed", String(completed));
    li.addEventListener("click", () => toggleTodo(id));
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "todo-delete";
    delBtn.textContent = "删除";
    delBtn.setAttribute("aria-label", `删除：${text}`);
    delBtn.addEventListener("click", event => {
      event.stopPropagation();
      removeTodo(id);
    });
    li.append(toggle, delBtn);
    list.appendChild(li);
  });
}

if (list && input && addBtn) {
  const submit = () => {
    if (!input.value.trim()) return;
    addTodo(input.value);
    input.value = "";
    input.focus();
  };
  addBtn.addEventListener("click", submit);
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.isComposing) submit();
  });
  render();
} else {
  console.warn("Todo 初始化失败：缺少必要元素。");
}
