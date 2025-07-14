"use client";
import customAxios from "@/config/axios";
import errorHandler from "@/utils/errorHandler";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  DotsThreeIcon,
  NoteIcon,
  PenIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useGlobalStore } from "@/utils/zustand/globalStore";
import { useUserStore } from "@/utils/zustand/userStore";
import SidebarWrapper from "./SidebarWrapper";
import Menu from "./Menu";
import deleteSlate from "@/utils/deleteSlate";
import renameSlate from "@/utils/renameSlate";
import { useLongPress } from "use-long-press";
import { generateUUID } from "@/utils/generateUUID";

function SidebarLeft() {
  const [slates, setSlates] = useState<Array<SlateMinimal>>([]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [slateCountToShow, setSlateCountToShow] = useState(10);

  const [renamingSlateId, setRenamingSlateId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [hightlightSwitchedSlateId, setHightlightSwitchedSlateId] = useState<
    string | null
  >(null);

  const renamingInputRef = useRef<HTMLInputElement>(null);
  const longPressTriggered = useRef(false);

  const sidebarOpen = useGlobalStore((state) => state.leftSidebarOpen);
  const setSidebarOpen = useGlobalStore((state) => state.setLeftSidebarOpen);
  const setModal = useGlobalStore((state) => state.setModalOpen);
  const latestUpdatedSlateId = useGlobalStore(
    (state) => state.latestUpdatedSlateId
  );

  const truggerSlatesRefetch = useGlobalStore(
    (state) => state.triggerSlatesRefetch
  );

  const modal = useGlobalStore((state) => state.modalOpen);

  const setRightSidebarOpen = useGlobalStore(
    (state) => state.setRightSidebarOpen
  );

  const user = useUserStore((state) => state.user);

  const slateButtonRefs = useRef(new Map<string, HTMLButtonElement>());

  const router = useRouter();
  const params = useParams();

  const createNewSlate = async () => {
    const toastId = toast.loading("Creating new slate...");

    try {
      const res = await customAxios.post("/slate/new");
      const { data: slate } = res;

      toast.success("Slate created successfully", {
        id: toastId,
      });
      setSlates((prev) => [slate, ...prev]);
      router.push(`/slate/${slate.id}`);
    } catch (e) {
      errorHandler(e, toastId);
    }
  };

  const handleDeleteSlate = async (id: string) => {
    await deleteSlate(id, setSlates, params, router, slates);
    setMenuOpenId(null);
  };

  const handleRenameSlate = async (
    id: string,
    name: string,
    prevName: string
  ) => {
    await renameSlate(
      id,
      name,
      prevName,
      setSlates,
      setRenamingSlateId,
      setRenameValue
    );
  };

  const longPressHandlers = useLongPress(
    (e, c) => {
      setMenuOpenId(c?.context as string | null);
      longPressTriggered.current = true;
      console.log("Long press detected");
    },
    {
      captureEvent: false,
      cancelOnMovement: true,
    }
  );

  useEffect(() => {
    if (!renamingSlateId) return;
    const input = renamingInputRef.current;

    if (!input) return;
    input.focus();
  }, [renamingSlateId]);

  useEffect(() => {
    const fetchSlates = async () => {
      try {
        const guestToken = localStorage.getItem("guest-token");
        if (!guestToken && !user) {
          localStorage.setItem("guest-token", generateUUID());
        }

        const res = await customAxios.get("/slate/all");
        const { data: slates } = res;

        if (slates.length === 0) return;
        setSlates(slates);
      } catch (e) {
        errorHandler(e);
      }
    };
    fetchSlates();
  }, [user, truggerSlatesRefetch]);

  useLayoutEffect(() => {
    const firstSlateItem = document.getElementById("slate-item");
    const slateList = document.getElementById("slate-list");
    const createSlateButton = document.getElementById("create-slate");

    const handleResize = () => {
      if (!firstSlateItem || !slateList || !createSlateButton) return;

      const slateItemHeight = firstSlateItem.getBoundingClientRect().height;

      const slateItemStyle = window.getComputedStyle(firstSlateItem);
      const slateItemMarginTop = parseFloat(slateItemStyle.marginTop);
      const slateItemMarginBottom = parseFloat(slateItemStyle.marginBottom);

      const totalSlateItemHeight =
        slateItemHeight + slateItemMarginTop + slateItemMarginBottom;

      const createSlateButtonHeight =
        createSlateButton.getBoundingClientRect().height;

      const createSlateButtonStyle = window.getComputedStyle(createSlateButton);
      const createSlateButtonMarginTop = parseFloat(
        createSlateButtonStyle.marginTop
      );
      const createSlateButtonMarginBottom = parseFloat(
        createSlateButtonStyle.marginBottom
      );
      const totalCreateSlateButtonHeight =
        createSlateButtonHeight +
        createSlateButtonMarginTop +
        createSlateButtonMarginBottom;

      const totalListHeight =
        slateList.getBoundingClientRect().height - totalCreateSlateButtonHeight;

      const count = Math.floor(totalListHeight / totalSlateItemHeight);

      if (count < 1) {
        setSlateCountToShow(1);
        return;
      }

      console.log("setting slate count to show", count);
      setSlateCountToShow(count);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [slates]);

  useEffect(() => {
    if (slates[0]?.id !== latestUpdatedSlateId) {
      setSlates((prev) => {
        const updatedSlateIndex = prev.findIndex(
          (slate) => slate.id === latestUpdatedSlateId
        );
        if (updatedSlateIndex !== -1) {
          const updatedSlate = prev[updatedSlateIndex];
          const newSlates = [...prev];
          newSlates.splice(updatedSlateIndex, 1);
          newSlates.unshift(updatedSlate);
          return newSlates;
        }
        return prev;
      });
    }
  }, [latestUpdatedSlateId]);

  return (
    <SidebarWrapper
      setSidebarOpen={setSidebarOpen}
      sidebarOpen={sidebarOpen}
      allowClosingSidebar={!modal && !renamingSlateId && !menuOpenId}
      side="left"
    >
      <div className="flex flex-col h-full justify-between pt-12">
        <div
          className={`flex flex-col h-full text-sm overflow-hidden`}
          id="slate-list"
        >
          {slates.map((slate, index) => {
            if (index >= slateCountToShow) return null;

            return (
              <div
                className={`flex flex-col mt-2`}
                id="slate-item"
                key={slate.id}
              >
                <button
                  className={`flex flex-row text-start pl-[16px] py-[8px] justify-between group hover:bg-silver ${
                    (menuOpenId == slate.id || renamingSlateId == slate.id) &&
                    "z-40 bg-silver"
                  } ${
                    (params.id == slate.id ||
                      hightlightSwitchedSlateId == slate.id) &&
                    "bg-ash"
                  }`}
                  onClick={() => {
                    if (longPressTriggered.current) {
                      return (longPressTriggered.current = false);
                    }
                    console.log("clicked");
                    setHightlightSwitchedSlateId(slate.id);
                    setSidebarOpen(false);
                    router.push(`/slate/${slate.id}`);
                  }}
                  {...longPressHandlers(slate.id)}
                  ref={(el) => {
                    if (!el) return;
                    slateButtonRefs.current.set(slate.id, el);
                  }}
                >
                  <div className="flex flex-row gap-2 overflow-hidden">
                    <div className="min-w-fit">{<NoteIcon size={22} />}</div>
                    {renamingSlateId === slate.id ? (
                      <input
                        value={renameValue}
                        className="w-full border-none outline-none"
                        ref={renamingInputRef}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => {
                          handleRenameSlate(slate.id, renameValue, slate.name);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameSlate(
                              slate.id,
                              renameValue,
                              slate.name
                            );
                          } else if (e.key === "Escape") {
                            setRenamingSlateId(null);
                            setRenameValue("");
                          }
                        }}
                      />
                    ) : (
                      <span className={`truncate`}>{slate.name}</span>
                    )}
                  </div>

                  <div
                    className={`rounded-sm text-smoke group-hover:opacity-100 group-hover:px-[4px] hover:bg-ash/40 hover:cursor opacity-0`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (menuOpenId) {
                        setMenuOpenId(null);
                      } else {
                        setMenuOpenId(slate.id);
                        setRightSidebarOpen(false);
                      }
                    }}
                  >
                    <DotsThreeIcon weight="bold" size={20} />
                  </div>
                </button>
                <Menu
                  isOpen={menuOpenId === slate.id}
                  position={{
                    top:
                      slateButtonRefs.current
                        ?.get(slate.id)
                        ?.getBoundingClientRect().top || 0,
                    left:
                      slateButtonRefs.current
                        ?.get(slate.id)
                        ?.getBoundingClientRect().right || 0,
                  }}
                  itemHeight="2rem"
                  items={[
                    {
                      icon: <PenIcon size={20} />,
                      text: "Rename",
                      onClick: () => {
                        setRenamingSlateId(slate.id);
                        setRenameValue(slate.name);
                        setMenuOpenId(null);
                      },
                    },
                    {
                      icon: <TrashIcon size={20} />,
                      text: "Delete",
                      className: "text-red-500",
                      onClick: () => {
                        handleDeleteSlate(slate.id);
                      },
                    },
                  ]}
                />
                {(slate.id == menuOpenId || slate.id == renamingSlateId) && (
                  <div
                    className="fixed z-30 bg-black/20 backdrop-blur-[1px] w-screen h-screen top-0"
                    onClick={() => setMenuOpenId(null)}
                  />
                )}
              </div>
            );
          })}

          <div className="flex flex-col py-1 mt-1 h-fit" id="create-slate">
            {slates.length > slateCountToShow && (
              <button
                className={`mb-2 text-smoke`}
                onClick={() => {
                  setModal("slates");
                }}
              >
                Show more
              </button>
            )}
            <button
              className="flex flex-row justify-center mx-2 px-[6px] py-[6px] border-dashed border-2 border-silver rounded-lg hover:bg-silver"
              onClick={() => {
                setHightlightSwitchedSlateId(null);
                createNewSlate();
              }}
            >
              <PlusIcon size={22} className="text-smoke" />
            </button>
          </div>
        </div>
      </div>
    </SidebarWrapper>
  );
}

export default SidebarLeft;
