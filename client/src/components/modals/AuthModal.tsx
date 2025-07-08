"use client";
import React from "react";
import {
  GoogleLogoIcon,
  MinusIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "@/config/firebase";
import customAxios from "@/config/axios";
import errorHandler from "@/utils/errorHandler";
const AuthModal = ({ close }: { close: () => void }) => {
  const handleGoogleAuth = async () => {
    const toastId = toast.loading("Loading...");
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      return errorHandler(e, toastId);
    }
    try {
      await customAxios.get("/auth/continueWithGoogle", {
        headers: { ForceTokenRefresh: true },
      });
      toast.success("Successfully signed in", { id: toastId });
      close();
    } catch (e) {
      signOut(auth);
      errorHandler(e, toastId);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-[#3a3a52]/40 backdrop-blur-[3px] flex items-center justify-center z-100"
      onClick={close}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.8, 0, 0.9, 1] }}
        className="relative bg-cloud rounded-md shadow-md p-8 max-w-md mx-4 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-6 right-6 p-1 text-smoke hover:text-graphite transition-colors"
        >
          <MinusIcon size={20} weight="regular" className="" />
        </button>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-graphite mb-2">Welcome</h2>
        </div>

        <div className="mb-6">
          <p className="text-sm text-smoke text-center">
            Sign in to continue to your account
          </p>
        </div>

        <button
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-silver bg-silver/20 rounded-lg hover:bg-silver hover:text-graphite transition-colors group text-graphite font-medium"
        >
          <GoogleLogoIcon size={20} className="" />
          <span>Continue with Google</span>
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-smoke">
            By continuing, you agree to the terms and conditions.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
export default AuthModal;
