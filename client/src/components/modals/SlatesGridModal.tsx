"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  NoteIcon,
  PenIcon,
  TrashIcon,
  MinusIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react";
import { useUserStore } from "@/utils/zustand/userStore";
import deleteSlate from "@/utils/deleteSlate";
import renameSlate from "@/utils/renameSlate";
import { fetchSlates } from "@/utils/fetchSlates";

interface SlateMinimal {
  id: string;
  name: string;
}

const SlateGridModal = ({ close }: { close: () => void }) => {
  const [slates, setSlates] = useState<Array<SlateMinimal>>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlateId, setActiveSlateId] = useState<string | null>(null);
  const [renamingSlateId, setRenamingSlateId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const renamingInputRef = useRef<HTMLInputElement>(null);
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const handleDelete = (slateId: string) => {
    deleteSlate(slateId, setSlates);
    setActiveSlateId(null);
  };

  const handleRename = (slate: SlateMinimal) => {
    setRenamingSlateId(slate.id);
    setRenameValue(slate.name);
    setActiveSlateId(null);
  };

  const handleRenameSubmit = (slateId: string, prevName: string) => {
    renameSlate(
      slateId,
      renameValue,
      prevName,
      setSlates,
      setRenamingSlateId,
      setRenameValue
    );
  };

  useEffect(() => {
    if (!renamingSlateId) return;
    const input = renamingInputRef.current;
    if (!input) return;
    input.focus();
  }, [renamingSlateId]);

  useEffect(() => {
    const loadSlates = async () => {
      await fetchSlates(user, setSlates);
      setLoading(false);
    };
    loadSlates();
  }, [user]);

  // const numColumns = Math.ceil(slates.length / 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#3a3a52]/40 backdrop-blur-[3px] flex items-center justify-center z-100"
      onClick={close}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-cloud rounded-md shadow-md p-6 mx-4 w-[90vw] max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-graphite">All Slates</h2>
          <button
            onClick={close}
            className="p-1 text-smoke hover:text-graphite transition-colors"
          >
            <MinusIcon size={20} />
          </button>
        </div>

        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="text-smoke">Loading slates...</div>
          </div>
        ) : slates.length === 0 ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="text-smoke">No slates found...</div>
          </div>
        ) : (
          <div
            className="grid h-[80vh] gap-2 overflow-scroll no-scrollbar"
            style={{
              gridTemplateColumns: "repeat(auto-fill)",
              gridTemplateRows: "repeat(auto-fill, 60px)",
              gridAutoFlow: "column",
            }}
          >
            {slates.map((slate) => (
              <div
                key={slate.id}
                className="relative group p-3 border border-silver rounded-md hover:bg-silver/20 transition-colors cursor-pointer flex items-center"
                onClick={() => {
                  if (renamingSlateId || activeSlateId) return;
                  router.push(`/slate/${slate.id}`);
                  close();
                }}
              >
                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                  <NoteIcon size={20} className="text-smoke" />
                  {renamingSlateId === slate.id ? (
                    <input
                      ref={renamingInputRef}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRenameSubmit(slate.id, slate.name)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRenameSubmit(slate.id, slate.name);
                        } else if (e.key === "Escape") {
                          setRenamingSlateId(null);
                          setRenameValue("");
                        }
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-sm truncate">{slate.name}</span>
                  )}
                </div>

                {activeSlateId === slate.id && (
                  <div className="absolute top-full left-0 mt-1 bg-cloud border border-silver rounded-md shadow-md z-10 min-w-32">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(slate);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-silver/20 flex items-center gap-2"
                    >
                      <PenIcon size={16} />
                      Rename
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(slate.id);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-silver/20 flex items-center gap-2 text-red-500"
                    >
                      <TrashIcon size={16} />
                      Delete
                    </button>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSlateId(
                      activeSlateId === slate.id ? null : slate.id
                    );
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-ash/40 rounded transition-opacity"
                >
                  <DotsThreeIcon weight="bold" size={22} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeSlateId && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => setActiveSlateId(null)}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default SlateGridModal;
