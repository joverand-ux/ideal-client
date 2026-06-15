"use client";
import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");

  const add = (tag: string) => {
    const trimmed = tag.trim().replace(/,$/, "");
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput("");
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 border border-gray-600 rounded-lg p-2 bg-gray-800 min-h-[42px]">
      {value.map((tag) => (
        <span key={tag} className="flex items-center gap-1 bg-blue-600 text-white text-sm px-2 py-0.5 rounded-full">
          {tag}
          <button type="button" onClick={() => remove(tag)} className="hover:text-blue-200 leading-none">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => input && add(input)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="bg-transparent text-white text-sm outline-none flex-1 min-w-[120px] placeholder-gray-500"
      />
    </div>
  );
}
