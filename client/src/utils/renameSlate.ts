import React from "react";
import customAxios from "@/config/axios";
import errorHandler from "@/utils/errorHandler";
import toast from "react-hot-toast";

const renameSlate = async (
  id: string,
  name: string,
  prevName: string,
  setSlates: React.Dispatch<React.SetStateAction<Array<SlateMinimal>>>,
  setRenamingSlateId: React.Dispatch<React.SetStateAction<string | null>>,
  setRenameValue: React.Dispatch<React.SetStateAction<string>>
) => {
  if (name === "" || name === prevName) {
    setRenamingSlateId(null);
    return;
  }

  const toastId = toast.loading("Renaming slate...");
  try {
    const res = await customAxios.post(`/slate/rename/${id}`, { name });
    const { data: slate } = res;

    setSlates((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: slate.name } : s))
    );

    setRenamingSlateId(null);
    setRenameValue("");

    toast.success("Slate renamed successfully", {
      id: toastId,
    });
  } catch (e) {
    errorHandler(e, toastId);
  }
};

export default renameSlate;
