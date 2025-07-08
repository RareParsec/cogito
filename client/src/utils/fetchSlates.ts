import customAxios from "@/config/axios";
import errorHandler from "./errorHandler";

export const fetchSlates = async (
  user: User | null,
  setSlates: React.Dispatch<React.SetStateAction<Array<SlateMinimal>>>
) => {
  try {
    const guestToken = localStorage.getItem("guest-token");
    if (!guestToken && !user) {
      localStorage.setItem("guest-token", crypto.randomUUID());
    }

    const res = await customAxios.get("/slate/all");
    const { data: slates } = res;

    if (slates.length === 0) return;
    setSlates(slates);
  } catch (e) {
    errorHandler(e);
  }
};
