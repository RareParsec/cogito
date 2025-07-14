"use client";
import customAxios from "@/config/axios";
import { useUserStore } from "@/utils/zustand/userStore";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function NotFound() {
  const user = useUserStore((state) => state.user);

  const router = useRouter();

  const redirectToFirstSlate = async () => {
    try {
      if (!user) {
        const guestToken = localStorage.getItem("guest-token");

        if (!guestToken) {
          const rngGuestToken = Math.random().toString(36).substring(2, 18);
          localStorage.setItem("guest-token", rngGuestToken);
        }
      }

      const res = await customAxios.get("/slate/all");
      router.replace(`/slate/${res.data[0].id}`);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    redirectToFirstSlate();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center mt-24">
      <div>Not found. redirecting...</div>
      <button
        className="bg-mist text-smoke p-2 px-3 rounded-lg mt-3"
        onClick={redirectToFirstSlate}
      >
        Not redirected yet?
      </button>
    </div>
  );
}

export default NotFound;
