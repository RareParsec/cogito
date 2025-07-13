"use client";
import React from "react";
import { motion } from "framer-motion";
import { useGlobalStore } from "@/utils/zustand/globalStore";

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

  const isMobile = window.innerWidth < 480;

  return (
    <div
      className={`relative h-full w-full flex ${
        side == "right" && "justify-end"
      }`}
      onMouseLeave={() => {
        if (!allowClosingSidebar || isMobile) return;
        setSidebarOpen(false);
      }}
    >
      <motion.div
        animate={{
          width: sidebarOpen
            ? isMobile
              ? side == "right"
                ? "55%"
                : "65%"
              : "13rem"
            : "0rem",
        }}
        initial={{
          width: sidebarOpen
            ? isMobile
              ? side == "right"
                ? "55%"
                : "65%"
              : "13rem"
            : "0rem",
        }}
        transition={
          sidebarOpen
            ? { type: "spring", stiffness: 350, damping: 25 }
            : { duration: 0.2, ease: "easeInOut" }
        }
        className={`relative z-20 bg-mist border-ash h-full pointer-events-auto`}
      >
        {children}
      </motion.div>

      {sidebarOpen && (
        <div
          className="hidden max-md:flex fixed top-0 right-0 w-full h-full bg-black/40 backdrop-blur-[2px] z-10 pointer-events-auto"
          onClick={() => {
            if (!allowClosingSidebar) return;
            setSidebarOpen(false);
          }}
        />
      )}
      <div
        className={`absolute top-0 h-screen z-10 bg-transparent max-md:hidden ${
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

export default SidebarWrapper;
