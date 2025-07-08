import { AxiosError } from "axios";
import toast from "react-hot-toast";

const errorHandler = (error: unknown, toastId?: string) => {
  console.log(error);

  const err = error as AxiosError<{ message?: string | string[] }>;

  if (err.response) {
    // NestJS/backend error
    const message = err.response.data?.message || "Server error";
    toast.error(
      Array.isArray(message) ? message[0] : message,
      toastId ? { id: toastId } : undefined
    );
  } else if (err.request) {
    // Request made, no response
    toast.error(
      "No response from server.",
      toastId ? { id: toastId } : undefined
    );
  } else {
    // Axios setup issue or client-side failure
    toast.error(
      "Request error: " + err.message,
      toastId ? { id: toastId } : undefined
    );
  }
};

export default errorHandler;
