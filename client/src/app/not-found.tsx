"use client";
import customAxios from "@/config/axios";
import { useUserStore } from "@/utils/zustand/userStore";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function NotFound() {
  const user = useUserStore((state) => state.user);

  const router = useRouter();

  useEffect(() => {
    const fetchAllSlates = async () => {
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
    fetchAllSlates();
  }, []);

  return (
    <div className="w-full h-full flex flex-row justify-center mt-24">
      Not found... redirecting
    </div>
  );
}

export default NotFound;
