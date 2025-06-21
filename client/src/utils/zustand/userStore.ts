import { create } from "zustand";
import { combine } from "zustand/middleware";

type User = {
  uid: string;
  email: string;
};

export const useUserStore = create(
  combine(
    {
      user: null as User | null,
    },
    (set) => ({
      clearUser: () => {
        set({ user: null });
      },
      setUser: (uid: string | null, email: string | null) => {
        if (!uid || !email) {
          set({ user: null });
          return;
        }

        set({
          user: {
            uid,
            email,
          },
        });
      },
    })
  )
);
