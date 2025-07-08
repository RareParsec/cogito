import AuthModal from "@/components/modals/AuthModal";
import ShareModal from "@/components/modals/ShareModal";
import SlatesGridModal from "@/components/modals/SlatesGridModal";
import { useGlobalStore } from "@/utils/zustand/globalStore";
import { AnimatePresence } from "motion/react";
import React from "react";

function ModalRenderer() {
  const modal = useGlobalStore((state) => state.modalOpen);
  const closeModal = useGlobalStore((state) => state.closeModal);

  return (
    <AnimatePresence mode="wait">
      {modal && (
        <>
          {modal === "auth" && <AuthModal close={() => closeModal()} />}
          {modal === "share" && <ShareModal close={() => closeModal()} />}
          {modal === "slates" && <SlatesGridModal close={() => closeModal()} />}
        </>
      )}
    </AnimatePresence>
  );
}

export default ModalRenderer;
