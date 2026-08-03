"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Minus } from "lucide-react";
import "./rich-text-editor.css";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        "rounded p-1.5 text-gray-500 transition-colors hover:bg-[#FFEDD5] hover:text-[#EA580C]",
        active ? "bg-[#FED7AA] text-[#EA580C]" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Describe the work or services...",
  error,
  label,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder })],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: "rich-editor-content" },
    },
    immediatelyRender: false,
  });

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-800">{label}</label>
      )}
      <div
        className={[
          "overflow-hidden rounded-lg border bg-white",
          error ? "border-red-400" : "border-[#FED7AA]",
          "focus-within:ring-2 focus-within:ring-[#EA580C] focus-within:border-transparent",
        ].join(" ")}
      >
        <div className="flex items-center gap-0.5 border-b border-[#FFEDD5] bg-[#FFF7ED] px-2 py-1.5">
          <ToolbarButton title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-4 w-px bg-[#FED7AA]" />
          <ToolbarButton title="Heading 2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })}>
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Heading 3" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })}>
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-4 w-px bg-[#FED7AA]" />
          <ToolbarButton title="Bullet list" onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Numbered list" onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Divider" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
            <Minus className="h-4 w-4" />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
