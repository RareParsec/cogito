import { create } from "zustand";
import { combine } from "zustand/middleware";

type Themes = "light" | "dark";

export const useGlobalStore = create(
  combine(
    {
      theme: null as Themes | null,
      wordCountShown: false,
      leftSidebarOpen: true,
      rightSidebarOpen: true,

      sidebarActivationWidth: 218,

      modalOpen: null as "auth" | "share" | null,
    },
    (set) => ({
      setTheme(theme: "light" | "dark") {
        localStorage.setItem("theme", theme);

        const rootHtml = document.getElementById("rootHtml");
        if (!rootHtml) return;

        const hasTheme = rootHtml.className.match(/(light|dark)/);
        if (hasTheme) {
          rootHtml.className = rootHtml.className.replace(
            /(light|dark)/,
            theme
          );
        } else {
          rootHtml.className += ` ${theme}`;
        }

        set({ theme });
      },
      toggleWordCountShown() {
        set((state) => ({ wordCountShown: !state.wordCountShown }));
      },
      setLeftSidebarOpen(open: boolean) {
        set({ leftSidebarOpen: open });
      },
      setRightSidebarOpen(open: boolean) {
        set({ rightSidebarOpen: open });
      },
      setModalOpen(modal: "auth" | "share" | null) {
        set({ modalOpen: modal });
      },
      closeModal() {
        set({ modalOpen: null });
      },
      setSidebarActivationWidth(width: number) {
        set({ sidebarActivationWidth: width });
      },
    })
  )
);
