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
  viewing = false,
  setValue,
  setWordCount,
}: {
  className?: string;
  style?: React.CSSProperties;
  content: Content;
  viewing?: boolean;
  setValue?: (value: Content) => void;
  setWordCount: (count: number) => void;
}) => {
  const editor = useEditor({
    editable: !viewing,
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
        placeholder: `Write here...`,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "tiptap outline-none h-fit min-h-full pt-15 px-[10%] max-md:px-6 max-md:pt-18",
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
