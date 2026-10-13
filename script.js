(function () {
  const todoInput = document.getElementById("todo-input");
  const todoAddButton = document.getElementById("todo-add-btn");
  const todoList = document.getElementById("todo-list");

  // 页面结构改变时，停止初始化并提示缺失的依赖。
  if (todoInput === null || todoAddButton === null || todoList === null) {
    console.warn("Todo 初始化失败：缺少输入框、添加按钮或列表元素。");
    return;
  }

  todoAddButton.addEventListener("click", function () {
    const todoText = todoInput.value.trim();

    // 空输入和纯空白输入不创建列表项。
    if (todoText === "") {
      return;
    }

    const todoItem = document.createElement("li");
    todoItem.textContent = todoText;
    todoList.appendChild(todoItem);

    todoInput.value = "";
    // 可改进项：返回输入框，提升连续输入体验。
    todoInput.focus();
  });
})();
