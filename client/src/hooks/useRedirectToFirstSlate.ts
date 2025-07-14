import customAxios from "@/config/axios";
import { useUserStore } from "@/utils/zustand/userStore";
import { useRouter } from "next/navigation";

export const useRedirectToFirstSlate = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const redirect = async () => {
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
      throw e;
    }
  };

  return redirect;
};
