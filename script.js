"use strict";

// todos 是唯一任务状态；filter 只控制显示，不写入存储。
const KEY = "web-week7-todos";
const list = document.getElementById("todo-list");
const input = document.getElementById("todo-input");
const addBtn = document.getElementById("todo-add-btn");
const storageStatus = document.getElementById("todo-storage-status");
let storageMessage = "";
let todos = load();
let filter = "all";

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(todos));
    storageMessage = "";
  } catch {
    storageMessage = "当前更改仅保留在此页面，无法保存；刷新后可能丢失。";
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    // 有效 JSON 不一定是任务数组；重复 ID 也会导致一次删除多项。
    const valid = Array.isArray(parsed) && parsed.every(t =>
      t !== null && typeof t === "object" &&
      typeof t.id === "string" && t.id.length > 0 &&
      typeof t.text === "string" && t.text.trim().length > 0 &&
      typeof t.completed === "boolean");
    if (!valid || new Set(parsed.map(t => t.id)).size !== parsed.length) {
      throw new Error("Invalid todo data");
    }
    return parsed;
  } catch {
    storageMessage = "无法恢复已存任务，暂显示空列表；原存储未改动，新增任务后会尝试覆盖保存。";
    return [];
  }
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

// 保留未完成任务，并同步保存与渲染。
function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  save();
  render();
}

function setFilter(value) {
  if (!["all", "done", "active"].includes(value)) return;
  filter = value;
  render();
}

function toggleTodo(id) {
  todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  save();
  render();
}

function render() {
  if (!list) return;
  // render 重建节点，先记住当前操作位置，再在新节点上恢复焦点。
  const active = document.activeElement;
  const focusedId = list.contains(active) ? active.closest("li")?.dataset.id : null;
  const focusedAction = active?.classList.contains("todo-delete") ? ".todo-delete" : ".todo-toggle";
  list.replaceChildren();
  const shown = todos.filter(t =>
    filter === "all" ? true : filter === "done" ? t.completed : !t.completed);
  shown.forEach(({ id, text, completed }) => {
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
  const done = todos.reduce((count, t) => count + (t.completed ? 1 : 0), 0);
  document.getElementById("todo-summary").textContent = `共 ${todos.length} 项，已完成 ${done} 项，未完成 ${todos.length - done} 项`;
  document.getElementById("todo-empty").hidden = shown.length > 0;
  document.querySelectorAll("[data-filter]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
  });
  if (storageStatus) storageStatus.textContent = storageMessage;
  if (focusedId) {
    const row = Array.from(list.children).find(li => li.dataset.id === focusedId);
    (row?.querySelector(focusedAction) || input)?.focus();
  }
}

if (list && input && addBtn && document.getElementById("todo-summary") && document.getElementById("todo-empty")) {
  const submit = () => {
    if (!input.value.trim()) return;
    addTodo(input.value);
    input.value = "";
    input.focus();
  };
  document.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });
  addBtn.addEventListener("click", submit);
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.isComposing) submit();
  });
  render();
} else {
  console.warn("Todo 初始化失败：缺少必要元素。");
}
