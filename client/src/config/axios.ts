import axios from "axios";
import { auth } from "./firebase";

const customAxios = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
});

customAxios.defaults.headers.post["Content-Type"] = "application/json";

customAxios.interceptors.request.use(
  async (config) => {
    const ForceTokenRefresh = config.headers.ForceTokenRefresh || false;
    // console.log("refreshing token:", ForceTokenRefresh);
    const token = await auth.currentUser?.getIdToken(ForceTokenRefresh);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const guestToken = localStorage.getItem("guest-token");
    config.headers["x-guest-token"] = guestToken || null;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default customAxios;
