"use client";
import Tiptap from "@/components/Tiptap";
import customAxios from "@/config/axios";
import errorHandler from "@/utils/errorHandler";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Content } from "@tiptap/react";
import { debounce } from "lodash";
import { useGlobalStore } from "@/utils/zustand/globalStore";
import { AxiosError } from "axios";

function Slate() {
  const [initialState, setInitialState] = useState<Slate | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [allowContentUpdates, setAllowContentUpdates] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const wordCountShown = useGlobalStore((state) => state.wordCountShown);

  const params = useParams();

  const saveContent = useCallback(
    debounce(async (contentToSave: Content) => {
      try {
        await customAxios.post(`/slate/${params.id}`, {
          content: contentToSave,
        });
      } catch (e) {
        errorHandler(e);
        console.log("Failed to save content:", e);
      }
    }, 1000),
    [params.id]
  );

  useEffect(() => {
    const fetchSlate = async () => {
      try {
        const res = await customAxios.get(`/slate/` + params.id);
        const { data: slate } = res;

        setInitialState(slate);
        setContent(slate.content);

        setAllowContentUpdates(true);
      } catch (e: unknown) {
        const err = e as AxiosError<{ message?: string }>;

        if (err.response?.status === 404) {
          setError("404");
        } else {
          setError(err.response?.data?.message || "Server error...");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSlate();
  }, [params.id]);

  useEffect(() => {
    if (!allowContentUpdates) return;

    saveContent(content);
  }, [content, allowContentUpdates, saveContent]);

  if (loading) {
    return (
      <div className="flex flex-col w-full items-center mt-24">
        <div className="flex flex-row items-end justify-center gap-1">
          <span className="font-medium">Loading</span>
          <div className="flex gap-1 mb-[5px]">
            <div className="w-1 h-1 bg-graphite rounded-full animate-bounce"></div>
            <div
              className="w-1 h-1 bg-graphite rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-1 h-1 bg-graphite rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error == "404") {
    return (
      <div className="flex flex-col items-center mt-24">
        <div className="text-2xl font-bold text-roseRed">404</div>
        <div className="text-md text-graphite">Slate not found...</div>
        <div className="text-sm text-gray-500 mt-3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full items-center mt-24 px-[10%] text-center">
        <div className="text-roseRed font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      <Tiptap
        content={initialState?.content || ""}
        className={`min-w-full overflow-scroll flex-grow outline-none leading-snug no-scrollbar`}
        setValue={setContent}
        setWordCount={setWordCount}
      />
      <div
        className={`absolute bottom-0 right-0 mb-2 flex flex-row px-4 text-smoke text-sm justify-end pb-1 ${
          wordCountShown ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col">{wordCount} words</div>
      </div>
    </div>
  );
}

export default Slate;
