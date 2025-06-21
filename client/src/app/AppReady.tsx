"use client";

import { auth } from "@/config/firebase";
// import { useUserStore } from "@/zustand/userStore";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FeatherIcon } from "@phosphor-icons/react";
import { useGlobalStore } from "@/utils/zustand/globalStore";
import { useUserStore } from "@/utils/zustand/userStore";
import customAxios from "@/config/axios";
import errorHandler from "@/utils/errorHandler";

function AppReady({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  const setTheme = useGlobalStore((state) => state.setTheme);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    setTheme(
      currentTheme == "dark" || currentTheme == "light" ? currentTheme : "light"
    );

    const unsub = onAuthStateChanged(auth, async () => {
      if (!auth.currentUser) clearUser();

      setUser(auth?.currentUser?.uid || null, auth?.currentUser?.email || null);

      if (auth.currentUser) {
        const guestToken = localStorage.getItem("guest-token");

        if (guestToken) {
          try {
            await customAxios.post(
              "/slate/transfer-guest-slate",
              {},
              {
                headers: {
                  ForceTokenRefresh: "true",
                },
              }
            );

            localStorage.removeItem("guest-token");
          } catch (e) {
            errorHandler(e);
          }
        }
      }

      setTimeout(() => {
        setReady(true);
      }, 1000);
    });
    return () => {
      unsub();
    };
  }, []);

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
