"use client";
import Tiptap from "@/components/Tiptap";
import { PencilIcon, PenIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { Menu, MenuButton, MenuItem, SubMenu } from "@szhsin/react-menu";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
// import "@szhsin/react-menu/dist/index.css";

export default function Home() {
  const [padding, setPadding] = useState(200);

  const container = document.createElement("div");
  container.className = "my-editor-wrapper"; // Add your own classes
  document.body.appendChild(container);

  const editor = useEditor({
    extensions: [StarterKit],
    element: container,
    content: "<p>Hello World!</p>",
  });

  useEffect(() => {
    const handleResize = () => {
      const newPadding = window.innerWidth * 0.2;
      setPadding(newPadding);
    };

    // Initial padding calculation
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const refref = useRef<HTMLDivElement>(null);

  const startto = () => {
    refref.current = setTimeout(() => {
      console.log("startubg");
    }, 2000);
  };

  const cancelto = () => {
    if (refref.current) {
      clearTimeout(refref.current);
      refref.current = null;
    }
    console.log("cancelto");
  };

  return (
    <div>
      <div className="w-52 h-52 bg-purple-500" onClick={startto}></div>
      <div className="w-52 h-52 bg-orange-500" onClick={cancelto}></div>
    </div>
  );
}

//ancb
