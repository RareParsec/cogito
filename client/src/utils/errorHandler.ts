import toast, { ToastType } from "react-hot-toast";

const errorHandler = (error: any, toastId?: string) => {
  console.log(error);
  if (error.response) {
    // NestJS/backend error
    const message = error.response.data?.message || "Server error";
    toast.error(
      Array.isArray(message) ? message[0] : message,
      toastId ? { id: toastId } : undefined
    );
  } else if (error.request) {
    // Request made, no response
    toast.error(
      "No response from server.",
      toastId ? { id: toastId } : undefined
    );
  } else {
    // Axios setup issue or client-side failure
    toast.error(
      "Request error: " + error.message,
      toastId ? { id: toastId } : undefined
    );
  }
};

export default errorHandler;
