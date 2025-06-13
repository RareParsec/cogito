"use client";
import Tiptap from "@/components/Tiptap";
import customAxios from "@/config/axios";
import errorHandler from "@/utils/errorHandler";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Content } from "@tiptap/react";
import { debounce } from "lodash";

function Slate() {
  const [initialState, setInitialState] = useState<Slate | null>(null);
  const params = useParams();
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState<Content | null>(null);

  const [allowContentUpdates, setAllowContentUpdates] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const saveContent = useCallback(
    debounce(async (contentToSave: Content) => {
      console.log("Debounced save with latest content:", contentToSave);
      try {
        await customAxios.post(`/slate/${params.id}`, {
          content: contentToSave,
        });
      } catch (e) {
        errorHandler(e);
        console.error("Failed to save content:", e);
      }
    }, 1000),
    [params.id] // Dependencies for useCallback
  );

  useEffect(() => {
    const fetchSlate = async () => {
      try {
        const res = await customAxios.get(`/slate/` + params.id);
        const { data: slate } = res;

        setInitialState(slate);
        setContent(slate.content);
        setAllowContentUpdates(true);
      } catch (e: any) {
        console.error("Error fetching slate:", e.response?.status);
        if (e.response?.status === 404) {
          return setError("slate not found :(");
        } else {
          setError(e.response.data?.message || "Server error");
        }

        errorHandler(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSlate();
  }, []);

  useEffect(() => {
    if (!allowContentUpdates || content == null) return;

    saveContent(content);
  }, [content, allowContentUpdates, saveContent]);

  if (loading || error) {
    return (
      <div className="flex no-scrollbar items-center mt-24">
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col no-scrollbar h-full">
      <Tiptap
        content={initialState?.content || ""}
        className={`prose h-full outline-none leading-snug no-scrollbar text-graphite`}
        setValue={setContent}
      />
    </div>
  );
}

export default Slate;
