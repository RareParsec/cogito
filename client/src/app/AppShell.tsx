"use client";
import customAxios from "@/config/axios";
import errorHandler from "@/utils/errorHandler";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  BirdIcon,
  DoorIcon,
  DotsThreeIcon,
  NoteIcon,
  PaintBrushIcon,
  PenIcon,
  PlusIcon,
  ShareIcon,
  TrashIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useGlobalStore } from "@/utils/zustand/globalStore";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { useUserStore } from "@/utils/zustand/userStore";
import ModalRenderer from "./ModalRenderer";
import { useInView } from "react-intersection-observer";

function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarActivationWidth = useGlobalStore(
    (state) => state.sidebarActivationWidth
  );

  return (
    <div className="flex flex-row h-screen max-h-screen no-scrollbar justify-between">
      <div className="flex flex-col">
        <SidebarLeft />
        <div style={{ width: sidebarActivationWidth }}></div>
      </div>
      <div className="flex-grow"> {children} </div>
      <div className="flex flex-col items-end">
        <div style={{ width: sidebarActivationWidth }}></div>
        <SidebarRight />
      </div>
      <ModalRenderer />
    </div>
  );
}

function SidebarWrapper({
  side,
  sidebarOpen,
  setSidebarOpen,
  allowClosingSidebar = true,
  children,
}: {
  side: "left" | "right";
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  allowClosingSidebar?: boolean;
  children: React.ReactNode;
}) {
  const sidebarActivationWidth = useGlobalStore(
    (state) => state.sidebarActivationWidth
  );

  return (
    <div
      className="relative"
      onMouseLeave={() => {
        if (!allowClosingSidebar) return;
        setSidebarOpen(false);
      }}
    >
      <motion.div
        animate={{ width: sidebarOpen ? "13rem" : "0" }}
        initial={{ width: sidebarOpen ? "13rem" : "0" }}
        className={`relative z-20 bg-mist border-ash h-screen`}
      >
        {children}
      </motion.div>

      <div
        className={`absolute top-0 h-screen z-10 ${
          side == "left" ? "left-0" : "right-0"
        }`}
        style={{ width: sidebarActivationWidth }}
        onMouseEnter={() => {
          setSidebarOpen(true);
        }}
      />
    </div>
  );
}

function SidebarLeft() {
  const [slates, setSlates] = useState<Array<SlateMinimal>>([]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [slateIndexToShow, setSlateIndexToShow] = useState<[number, number]>([
    0, 10,
  ]);

  const [renamingSlateId, setRenamingSlateId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renamingInputRef = useRef<HTMLInputElement>(null);

  const sidebarOpen = useGlobalStore((state) => state.leftSidebarOpen);
  const setSidebarOpen = useGlobalStore((state) => state.setLeftSidebarOpen);

  const modal = useGlobalStore((state) => state.modalOpen);

  const { ref, inView } = useInView({
    threshold: 0.5,
  });

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

  const deleteSlate = async (id: string) => {
    const toastId = toast.loading("Deleting slate...");
    try {
      await customAxios.delete(`/slate/${id}`);
      toast.success("Slate deleted successfully", {
        id: toastId,
      });
      setMenuOpenId(null);

      setSlates((prev) => prev.filter((slate) => slate.id !== id));
      if (params.id === id) {
        const routeToNavigate = slates.filter((s) => s.id !== id);
        if (routeToNavigate.length === 0) return;

        router.replace("/slate/" + routeToNavigate[0].id);
      }
    } catch (e) {
      errorHandler(e, toastId);
    }
  };

  const renameSlate = async (id: string, name: string, prevName: string) => {
    if (name === "" || name === prevName) {
      setRenamingSlateId(null);
      return;
    }

    const toastId = toast.loading("Renaming slate...");
    try {
      const res = await customAxios.post(`/slate/rename/${id}`, { name });
      const { data: slate } = res;

      setSlates((prev) =>
        prev.map((s) => (s.id === id ? { ...s, name: slate.name } : s))
      );

      setRenamingSlateId(null);
      setRenameValue("");

      toast.success("Slate renamed successfully", {
        id: toastId,
      });
    } catch (e) {
      errorHandler(e, toastId);
    }
  };

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
          localStorage.setItem("guest-token", crypto.randomUUID());
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
  }, [user]);

  useEffect(() => {
    console.log("in view", inView);

    if (!inView) return;

    if (slateIndexToShow[1] >= slates.length) return;
    setSlateIndexToShow((prev) => [prev[0], prev[1] + 10]);
  }, [inView, slateIndexToShow, slates.length]);

  return (
    <SidebarWrapper
      setSidebarOpen={setSidebarOpen}
      sidebarOpen={sidebarOpen}
      allowClosingSidebar={
        menuOpenId || renamingSlateId || modal ? false : true
      }
      side="left"
    >
      <div className="flex flex-col h-full justify-between pt-12 ">
        <div className="flex flex-col flex-grow min-h-0">
          <div
            id="slate-list"
            className={`flex flex-col text-sm no-scrollbar gap-2 ${
              menuOpenId ? "overflow-hidden" : "overflow-scroll"
            }`}
          >
            {/* <div className="sticky top-0">
              <div className="absolute top-0 w-full bg-gradient-to-b from-mist via-mist/90 to-transparent h-3" />
            </div> */}

            {slates.map((slate, index) => {
              if (index < slateIndexToShow[0] || index > slateIndexToShow[1]) {
                return null;
              }

              return (
                <div
                  className={`flex flex-col ${index == 0 && "mt-2"} ${
                    index == slates.length - 1 && "mb-2"
                  } `}
                  key={slate.id}
                >
                  <button
                    className={`flex flex-row text-start pl-[16px] py-[6px] justify-between group hover:bg-silver ${
                      (menuOpenId == slate.id || renamingSlateId == slate.id) &&
                      "z-40 bg-silver"
                    } ${params.id == slate.id && "bg-ash"}`}
                    onClick={() => router.push(`/slate/${slate.id}`)}
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
                            renameSlate(slate.id, renameValue, slate.name);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              renameSlate(slate.id, renameValue, slate.name);
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
                      className={`px-[4px] rounded-sm text-smoke group-hover:opacity-100 hover:bg-ash/40 hover:cursor opacity-0`}
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
                          deleteSlate(slate.id);
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

            <div className="w-full min-h-[50px] bg-red-500" ref={ref}></div>
          </div>
          <div>
            <div className="flex flex-col flex-grow mt-3 mb-12 overflow-x-hidden">
              <button
                className="flex flex-row justify-center mx-2 px-[6px] py-[6px] border-dashed border-2 border-silver rounded-lg hover:bg-silver"
                onClick={createNewSlate}
              >
                <PlusIcon size={22} className="text-smoke" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarWrapper>
  );
}

function SidebarRight() {
  const sidebarOpen = useGlobalStore((state) => state.rightSidebarOpen);
  const setSidebarOpen = useGlobalStore((state) => state.setRightSidebarOpen);

  const theme = useGlobalStore((state) => state.theme);
  const setTheme = useGlobalStore((state) => state.setTheme);
  const user = useUserStore((state) => state.user);

  const modal = useGlobalStore((state) => state.modalOpen);
  const setModal = useGlobalStore((state) => state.setModalOpen);

  const wordCountShown = useGlobalStore((state) => state.wordCountShown);
  const toggleWordCountShown = useGlobalStore(
    (state) => state.toggleWordCountShown
  );

  const router = useRouter();

  return (
    <SidebarWrapper
      setSidebarOpen={setSidebarOpen}
      sidebarOpen={sidebarOpen}
      allowClosingSidebar={modal ? false : true}
      side="right"
    >
      <div className="flex flex-col h-full justify-between w-full pt-16 text-sm">
        <div className="flex flex-col gap-1">
          <button
            className="flex flex-row text-start pl-[16px] py-[6px] justify-between group hover:bg-silver items-center"
            onClick={() => {
              setModal("share");
            }}
          >
            <div className="flex flex-row gap-2 w-full">
              <div className="min-w-fit">
                <ShareIcon size={22} />
              </div>
              <span className={`truncate`}>Share</span>
            </div>
          </button>

          <button
            className="flex flex-row text-start pl-[16px] py-[6px] justify-between group hover:bg-silver items-center"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <div className="flex flex-row gap-2 w-full">
              <div className="min-w-fit">
                <PaintBrushIcon size={22} />
              </div>
              <span className={`truncate`}>
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </div>
          </button>

          <button
            className="flex flex-row text-start pl-[16px] py-[6px] justify-between group hover:bg-silver items-center"
            onClick={() => {
              toggleWordCountShown();
            }}
          >
            <div className="flex flex-row gap-2 w-full">
              <div className="min-w-fit">
                <BirdIcon size={22} />
              </div>
              <span className={`truncate`}>
                {wordCountShown ? "Hide Word Count" : "Show Word Count"}
              </span>
            </div>
          </button>
        </div>
        {!user && (
          <button
            className="flex flex-row text-start pl-[16px] py-[6px] justify-between group hover:bg-silver items-center mb-5"
            onClick={() => setModal("auth")}
          >
            <div className="flex flex-row gap-2 w-full">
              <div className="min-w-fit">
                <UserIcon size={22} />
              </div>
              <span className={`truncate`}>Sign in</span>
            </div>
          </button>
        )}

        {user && (
          <div className="flex flex-col gap-1">
            <div className="flex flex-row text-start pl-[16px] py-[6px] justify-between group cursor-default items-center">
              <div className="flex flex-row gap-2 w-full">
                <div className="min-w-fit">
                  <UserIcon size={22} />
                </div>
                <span className={`truncate break-all break-words`}>
                  {auth.currentUser?.email}
                </span>
              </div>
            </div>
            <button
              className="flex flex-row text-start pl-[16px] py-[6px] justify-between group hover:bg-roseRed/10 items-center mb-5 text-roseRed"
              onClick={() => {
                signOut(auth);
                router.replace("/redirecting-to-slate-page");
              }}
            >
              <div className="flex flex-row gap-2 w-full">
                <div className="min-w-fit">
                  <DoorIcon size={22} />
                </div>
                <span className={`truncate`}>Sign out</span>
              </div>
            </button>
          </div>
        )}
      </div>
      {/* <ShareModal
        isOpen={user && shareModalOpen ? true : false}
        close={() => setShareModalOpen(false)}
      /> */}
    </SidebarWrapper>
  );
}

function Menu({
  isOpen,
  position,
  itemHeight,
  items,
}: {
  isOpen: boolean;
  position: { top: number; left: number };
  itemHeight: string;
  items: Array<{
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
    className?: string;
  }>;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: "0" }}
          exit={{ width: "0" }}
          animate={{
            width: "8rem",
          }}
          transition={{ duration: 0.2 }}
          className={`absolute flex flex-col left-full overflow-x-hidden ${
            isOpen && "z-40"
          }`}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {items.map((item, index) => {
            return (
              <div
                className={`flex flex-row bg-mist px-2 hover:bg-silver cursor-pointer items-center ${
                  item.className
                } ${
                  index == 0
                    ? "rounded-tr-sm"
                    : index == items.length - 1
                    ? "rounded-br-sm"
                    : ""
                }`}
                key={item.text}
                style={{
                  height: itemHeight,
                }}
                onClick={item.onClick}
              >
                <div>{item.icon}</div>
                <span className="ml-2">{item.text}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AppShell;
