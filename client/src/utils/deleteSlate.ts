import customAxios from "@/config/axios";
import errorHandler from "./errorHandler";
import toast from "react-hot-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const deleteSlate = async (
  id: string,
  setSlates: React.Dispatch<React.SetStateAction<Array<SlateMinimal>>>,
  params?: { id?: string },
  router?: AppRouterInstance,
  slates?: Array<SlateMinimal>
) => {
  const toastId = toast.loading("Deleting slate...");
  try {
    await customAxios.delete(`/slate/${id}`);
    toast.success("Slate deleted successfully", {
      id: toastId,
    });

    setSlates((prev) => prev.filter((slate) => slate.id !== id));

    if (params?.id === id && router && slates) {
      const routeToNavigate = slates.filter((s) => s.id !== id);
      if (routeToNavigate.length > 0) {
        router.replace("/slate/" + routeToNavigate[0].id);
      }
    }
  } catch (e) {
    errorHandler(e, toastId);
  }
};

export default deleteSlate;
