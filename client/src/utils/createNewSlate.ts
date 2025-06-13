import customAxios from "@/config/axios";
import errorHandler from "./errorHandler";

export default async function createNewSlate() {
  try {
    const res = await customAxios.get("/slate/new");

    const { data: slate } = res;

    window.location.href = `/slate/${slate.id}`;
  } catch (e) {
    errorHandler(e);
    console.error(e);
  }
}
