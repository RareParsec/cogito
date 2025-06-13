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
}: {
  className?: string;
  style?: React.CSSProperties;
  content: Content;
  setValue?: (value: Content) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: {
          HTMLAttributes: {
            class: "bg-gray-100 rounded p-2",
          },
        },
      }),
      CustomUnderline,
      Placeholder.configure({
        placeholder: "Write...",
      }),
    ],
    editorProps: {
      attributes: {
        class: "break-words break-all outline-none h-full px-[10%] pt-15",
      },
    },
    content,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      if (setValue) {
        setValue(json);
      }
    },
  });

  return <EditorContent editor={editor} className={className} style={style} />;
};

export default Tiptap;
