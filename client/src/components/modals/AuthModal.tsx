"use client";
import React, { useState } from "react";
import {
  X,
  GoogleLogo,
  XIcon,
  GoogleLogoIcon,
  MinusIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "@/config/firebase";
import customAxios from "@/config/axios";
import errorHandler from "@/utils/errorHandler";

const AuthModal = ({
  isOpen,
  close,
}: {
  isOpen: boolean;
  close: () => void;
}) => {
  const handleGoogleAuth = async () => {
    const toastId = toast.loading("Loading...");

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      toast.error("Failed...", { id: toastId });
      return;
    }

    try {
      await customAxios.get("/auth/continueWithGoogle", {
        headers: { ForceTokenRefresh: true },
      });

      toast.success("Successfully signed in", { id: toastId });
      close();
    } catch (error: any) {
      signOut(auth);
      errorHandler(error, toastId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-100"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.8, 0, 0.9, 1] }}
            className="bg-cloud rounded-2xl shadow-xl p-8 max-w-md mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-6 right-6 p-1 text-smoke"
            >
              <MinusIcon size={20} weight="regular" className="" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-graphite mb-2">
                Welcome
              </h2>
              <p className="text-smoke">Sign in to continue to your account</p>
            </div>

            <button
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-dashed border-smoke rounded-lg hover:bg-smoke transition-colors group text-graphite hover:text-cloud"
            >
              <GoogleLogoIcon size={20} weight="regular" className="" />
              <span className="font-medium">Continue with Google</span>
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                By continuing, you agree to the terms and conditions.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
