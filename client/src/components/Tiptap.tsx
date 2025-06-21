"use client";

import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Content, markInputRule } from "@tiptap/core";

const CustomUnderline = Underline.extend({
  addInputRules() {
    return [
      markInputRule({
        find: /(?:^|\s)(__([^_]+?)__)$/,
        type: this.type,
      }),
    ];
  },
});

const Tiptap = ({
  className,
  style,
  content,
  setValue,
  setWordCount,
}: {
  className?: string;
  style?: React.CSSProperties;
  content: Content;
  setValue?: (value: Content) => void;
  setWordCount: (count: number) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      // StarterKit.configure({
      //   code: {
      //     HTMLAttributes: {
      //       class: "bg-gray-100 rounded p-2",
      //     },
      //   },
      // }),
      CustomUnderline,
      Placeholder.configure({
        placeholder: "Write...",
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "tiptap break-words break-all outline-none h-fit min-h-full pt-15 px-[10%]",
        spellcheck: "false",
      },
    },
    content,
    onCreate: ({ editor }) => {
      const totalWords = editor
        .getText()
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

      setWordCount(totalWords);
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      if (setValue) {
        setValue(json);
      }

      const { from, to } = editor.state.selection;

      if (from === to) {
        const totalWords = editor
          .getText()
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;

        setWordCount(totalWords);
      } else {
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        const selectedWords = selectedText
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;

        setWordCount(selectedWords);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;

      if (from === to) {
        const totalWords = editor
          .getText()
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;

        setWordCount(totalWords);
      } else {
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        const selectedWords = selectedText
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;

        setWordCount(selectedWords);
      }
    },
  });

  return <EditorContent editor={editor} className={className} style={style} />;
};

export default Tiptap;
