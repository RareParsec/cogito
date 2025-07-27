"use client";
import React, { useEffect, useState } from "react";
import { ShareIcon, MinusIcon } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import customAxios from "@/config/axios";
import errorHandler from "@/utils/errorHandler";
import { useParams } from "next/navigation";
import { motion } from "motion/react";

const ShareModal = ({ close }: { close: () => void }) => {
  const [isShared, setIsShared] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const params = useParams();

  const handleToggleShare = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Updating share settings...");

    try {
      const res = await customAxios.post(`/slate/share/${params.id}`);

      setIsShared(res.data.shared);

      if (res.data.shared) {
        toast.success(
          "Document is now shared! Anyone with the link can view it.",
          { id: toastId }
        );

        const shareUrl = `${process.env.NEXT_PUBLIC_URL}/slate/${params.id}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard!");
      } else {
        toast.success("Document is now private.", { id: toastId });
      }
    } catch (e) {
      errorHandler(e, toastId);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchSlate = async () => {
      try {
        const res = await customAxios.get(`/slate/${params.id}`);
        setIsShared(res.data.shared);
      } catch (e) {
        errorHandler(e);
      }
    };
    fetchSlate();
  }, [params]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-[#3a3a52]/40 max-md:bg-[#3a3a52]/10 backdrop-blur-[3px] flex items-center justify-center z-100"
      onClick={close}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.8, 0, 0.9, 1] }}
        className="relative bg-mist rounded-md shadow-md p-8 max-w-md mx-4 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-6 right-6 p-1 text-smoke hover:text-graphite transition-colors"
        >
          <MinusIcon size={20} weight="regular" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-graphite mb-2">Share</h2>
        </div>

        <div className="mb-6">
          <p className="text-sm text-smoke text-center">
            {isShared
              ? "Anyone with the link can view this document. Click to make it private."
              : "Allow anyone with the link to view this document."}
          </p>
        </div>

        <button
          onClick={handleToggleShare}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-3 px-6 py-3 border-2 rounded-lg font-normal transition-all duration-200 group ${
            isShared
              ? "border-moss/60 bg-moss/15 text-moss hover:bg-moss hover:text-white"
              : "border-honeyGlow/60 bg-honeyGlow/15 text-honeyGlow hover:bg-honeyGlow hover:text-white"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShareIcon size={20} />
          )}
          <span>{isShared ? "Stop Sharing" : "Make Shareable"}</span>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ShareModal;
