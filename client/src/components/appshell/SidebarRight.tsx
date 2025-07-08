"use client";
import { useRouter } from "next/navigation";
import React from "react";
import {
  BirdIcon,
  DoorIcon,
  PaintBrushIcon,
  ShareIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useGlobalStore } from "@/utils/zustand/globalStore";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { useUserStore } from "@/utils/zustand/userStore";
import SidebarWrapper from "./SidebarWrapper";

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
            className={`flex flex-row text-start py-[6px] justify-between group hover:bg-silver items-center pl-[16px] overflow-hidden`}
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
            className="flex flex-row text-start pl-[16px] py-[6px] justify-between group hover:bg-silver items-center overflow-hidden"
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
            className="flex flex-row text-start pl-[16px] py-[6px] justify-between group hover:bg-silver items-center overflow-hidden"
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
            className="flex flex-row text-start pl-[16px] py-[6px] justify-between group hover:bg-silver items-center mb-5 overflow-hidden"
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
          <div className="flex flex-col gap-1 overflow-hidden">
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
    </SidebarWrapper>
  );
}

export default SidebarRight;
