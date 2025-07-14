"use client";
import React, { useEffect } from "react";
import { useGlobalStore } from "@/utils/zustand/globalStore";
import ModalRenderer from "./ModalRenderer";
import SidebarLeft from "@/components/appshell/SidebarLeft";
import SidebarRight from "@/components/appshell/SidebarRight";
import { useDynamicSidebarWidth } from "@/hooks/useDynamicWidth";
import MobileMenuBar from "@/components/MobileMenuBar";

function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarActivationWidth = useGlobalStore(
    (state) => state.sidebarActivationWidth
  );

  const isMobile = window.innerWidth < 480;
  const setLeftSidebarOpen = useGlobalStore(
    (state) => state.setLeftSidebarOpen
  );
  const setRightSidebarOpen = useGlobalStore(
    (state) => state.setRightSidebarOpen
  );

  useDynamicSidebarWidth(0.8);

  useEffect(() => {
    if (!isMobile) {
      setLeftSidebarOpen(true);
      setRightSidebarOpen(true);
    }
  }, []);

  return (
    <div
      className="relative flex flex-row w-full h-full no-scrollbar justify-between"
      onScroll={(e) => {
        console.log("scrolling", e.currentTarget.scrollTop);
      }}
    >
      <div className="flex flex-col max-md:absolute max-md:left-0 max-md:top-0 max-md:w-full h-full max-md:pointer-events-none">
        <SidebarLeft />
        <div style={{ width: sidebarActivationWidth }}></div>
      </div>
      <div className="flex flex-col flex-grow min-w-0">
        <MobileMenuBar />
        <div className="h-full min-w-0 allow-copy">{children}</div>
      </div>
      <div className="flex flex-col max-md:absolute max-md:right-0 max-md:top-0 max-md:w-full h-full max-md:pointer-events-none">
        <div style={{ width: sidebarActivationWidth }}></div>
        <SidebarRight />
      </div>
      <ModalRenderer />
    </div>
  );
}

export default AppShell;
