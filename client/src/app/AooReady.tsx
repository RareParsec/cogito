"use client";

import { auth } from "@/config/firebase";
// import { useUserStore } from "@/zustand/userStore";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FeatherIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

function AppReady({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  //   const refreshUser = useUserStore((state) => state.refreshUser);
  //   const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async () => {
      console.log("ready");
      //   await refreshUser()
      //     .then(() => {
      //       console.log("ready");
      //       setReady(true);
      //     })
      //     .catch((error) => {
      //       console.log(error);
      //       router.push("/auth");
      //     });
      setReady(true);
    });
    // const checkDevice = () => {
    //   setIsMobile(window.innerWidth <= 768);
    // };
    // checkDevice();
    // window.addEventListener("resize", checkDevice);
    return () => {
      unsub();
      //   window.removeEventListener("resize", checkDevice);
    };
  }, []);

  // if (isMobile) {
  //   return (
  //     <AnimatePresence>
  //       <div className="w-screen h-screen flex flex-col items-center justify-center">
  //         <Feather size={40} color="var(--color-deepBeaver)" />
  //         <div className=" text-beaver italic">This application in only currently available on desktop :&#40;</div>
  //       </div>
  //     </AnimatePresence>
  //   );
  // }

  if (!ready) {
    return (
      <AnimatePresence>
        <motion.div
          key="cogito-loading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-cloud"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: [-10, 0, -10] }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
              }}
              className="text-graphite"
            >
              <FeatherIcon size={40} />
            </motion.div>
            <div className="text-sm italic">Unfolding Cogito...</div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return <>{children}</>;
}

export default AppReady;
