"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Heading2, Strikethrough, Code } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isCodeView, setIsCodeView] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false, // Mematikan ekstensi link bawaan StarterKit untuk mencegah duplikat
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none p-4 min-h-[160px] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setRawHtml(html);
      onChange(html);
    },
  });

  // Sync external value changes if any
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !isCodeView) {
      editor.commands.setContent(value);
      setRawHtml(value);
    }
  }, [value, editor, isCodeView]);

  if (!editor) {
    return null;
  }

  const toggleCodeView = () => {
    if (isCodeView) {
      // Switching back to visual editor from code view
      editor.commands.setContent(rawHtml);
      onChange(rawHtml);
    } else {
      // Switching to code view
      setRawHtml(editor.getHTML());
    }
    setIsCodeView(!isCodeView);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between bg-gray-50 border-b border-gray-200 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          {!isCodeView && (
            <>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 ${editor.isActive("bold") ? "bg-gray-200 text-blue-600" : ""}`}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 ${editor.isActive("italic") ? "bg-gray-200 text-blue-600" : ""}`}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 ${editor.isActive("strike") ? "bg-gray-200 text-blue-600" : ""}`}
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </button>
              <span className="w-px h-4 bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200 text-blue-600" : ""}`}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 ${editor.isActive("bulletList") ? "bg-gray-200 text-blue-600" : ""}`}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 ${editor.isActive("orderedList") ? "bg-gray-200 text-blue-600" : ""}`}
                title="Ordered List"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Mode Toggle: Visual vs HTML Code */}
        <div>
          <button
            type="button"
            onClick={toggleCodeView}
            className={`px-2.5 py-1 rounded text-xs font-medium inline-flex items-center gap-1.5 transition ${
              isCodeView
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title="Toggle HTML Code View"
          >
            <Code className="h-3.5 w-3.5" />
            {isCodeView ? "Visual Mode" : "HTML Code"}
          </button>
        </div>
      </div>

      {/* Editor Content / Raw HTML Textarea */}
      {isCodeView ? (
        <textarea
          value={rawHtml}
          onChange={(e) => {
            setRawHtml(e.target.value);
            onChange(e.target.value);
          }}
          rows={6}
          placeholder={placeholder || "Write HTML code here..."}
          className="w-full p-4 font-mono text-xs text-gray-800 bg-gray-50 focus:outline-none"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}