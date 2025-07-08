import { useGlobalStore } from "@/utils/zustand/globalStore";
import { DotsThreeIcon, ListIcon, SidebarIcon } from "@phosphor-icons/react";
import React from "react";

function MobileMenuBar() {
  if (window.innerWidth >= 480) return null;

  const setLeftSidebarOpen = useGlobalStore(
    (state) => state.setLeftSidebarOpen
  );

  const setRightSidebarOpen = useGlobalStore(
    (state) => state.setRightSidebarOpen
  );

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-row justify-between backdrop-blur-[1px] z-10">
      <button
        className="p-4 px-5"
        onClick={() => {
          setLeftSidebarOpen(true);
        }}
      >
        <ListIcon size={23} className="text-ash" />
      </button>
      <button className="p-4 px-5" onClick={() => setRightSidebarOpen(true)}>
        <SidebarIcon size={23} className="text-ash" />
      </button>
    </div>
  );
}

export default MobileMenuBar;
