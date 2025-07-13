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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const wordCountShown = useGlobalStore((state) => state.wordCountShown);
  const setLatestUpdatedSlateId = useGlobalStore(
    (state) => state.setLatestUpdatedSlateId
  );
  const latestUpdatedSlateId = useGlobalStore(
    (state) => state.latestUpdatedSlateId
  );

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
    }, 300),
    [params.id]
  );

  useEffect(() => {
    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const keyboardHeight =
          window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(keyboardHeight);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        handleVisualViewportChange
      );
      return () => {
        window.visualViewport?.removeEventListener(
          "resize",
          handleVisualViewportChange
        );
      };
    }

    const handleResize = () => {
      const heightDiff = window.screen.height - window.innerHeight;
      if (heightDiff > 150) {
        setKeyboardHeight(heightDiff);
      } else {
        setKeyboardHeight(0);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchSlate = async () => {
      try {
        const res = await customAxios.get(`/slate/` + params.id);
        const { data: slate } = res;

        setInitialState(slate);

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
    if (!allowContentUpdates || content === null) return;

    saveContent(content);

    console.log(content);
    if (latestUpdatedSlateId !== params.id) {
      setLatestUpdatedSlateId((params.id as string) || null);
    }
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
    <div
      className="relative flex flex-col h-full"
      style={{
        paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : "0px",
        transition: "padding-bottom 0.3s ease-in-out",
      }}
    >
      <Tiptap
        content={initialState?.content || ""}
        viewing={initialState?.viewing || false}
        className={`w-full overflow-scroll flex-grow outline-none leading-snug no-scrollbar pb-13`}
        setValue={setContent}
        setWordCount={setWordCount}
      />
      {initialState?.viewing && (
        <div className="flex flex-row text-smoke/45 justify-center mb-18">
          Viewing Mode.
        </div>
      )}
      <div
        className={`absolute bottom-0 right-0 mb-3 flex flex-row px-4 text-smoke text-sm justify-end pb-1 ${
          wordCountShown ? "opacity-100" : "opacity-0"
        }`}
        style={{
          bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : "0px",
          transition: "bottom 0.3s ease-in-out",
        }}
      >
        <div className="flex flex-col">{wordCount} words</div>
      </div>
    </div>
  );
}

export default Slate;
