import { useGlobalStore } from "@/utils/zustand/globalStore";
import { ListIcon, SidebarIcon } from "@phosphor-icons/react";
import React from "react";

function MobileMenuBar() {
  const setLeftSidebarOpen = useGlobalStore(
    (state) => state.setLeftSidebarOpen
  );

  const leftSidebarOpen = useGlobalStore((state) => state.leftSidebarOpen);

  const setRightSidebarOpen = useGlobalStore(
    (state) => state.setRightSidebarOpen
  );

  const rightSidebarOpen = useGlobalStore((state) => state.rightSidebarOpen);

  if (window.innerWidth >= 480) return null;

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-row justify-between backdrop-blur-[1px] z-10">
      <button
        className="p-4 px-5"
        onClick={() => {
          setLeftSidebarOpen(true);
        }}
        disabled={leftSidebarOpen || rightSidebarOpen}
      >
        <ListIcon size={23} className="text-ash" />
      </button>
      <button
        className="p-4 px-5"
        onClick={() => setRightSidebarOpen(true)}
        disabled={rightSidebarOpen || leftSidebarOpen}
      >
        <SidebarIcon size={23} className="text-ash" />
      </button>
    </div>
  );
}

export default MobileMenuBar;
