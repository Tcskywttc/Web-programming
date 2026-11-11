import { useState } from "react";
import type { FormEvent, KeyboardEvent, RefObject } from "react";

export interface TodoFormProps {
  onAdd: (text: string) => boolean;
  inputRef: RefObject<HTMLInputElement | null>;
}

export default function TodoForm({ onAdd, inputRef }: TodoFormProps) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!onAdd(text)) {
      setMessage("请输入非空任务文字，且不要包含 script 标签。");
      return;
    }
    setText("");
    setMessage("");
    inputRef.current?.focus();
  }

  function protectComposition(event: KeyboardEvent<HTMLInputElement>): void {
    if (
      event.key === "Enter" &&
      (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)
    ) {
      event.preventDefault();
    }
  }

  return (
    <form onSubmit={submit}>
      <label className="todo-label" htmlFor="todo-input">
        新的待办事项
      </label>
      <div className="todo-controls">
        <input
          ref={inputRef}
          id="todo-input"
          className="todo-input"
          type="text"
          placeholder="输入一项待办事项"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setMessage("");
          }}
          onKeyDown={protectComposition}
          aria-describedby="todo-input-status"
        />
        <button id="todo-add-btn" className="todo-add-btn" type="submit">
          添加
        </button>
      </div>
      <p id="todo-input-status" className="todo-storage-status" role="status">
        {message}
      </p>
    </form>
  );
}
