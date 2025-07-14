import { create } from "zustand";
import { combine } from "zustand/middleware";

type Themes = "light" | "dark";

export const useGlobalStore = create(
  combine(
    {
      theme: null as Themes | null,
      wordCountShown: false,
      leftSidebarOpen: false,
      rightSidebarOpen: false,

      sidebarActivationWidth: 200,

      latestUpdatedSlateId: null as string | null,

      modalOpen: null as "auth" | "share" | "slates" | null,

      triggerSlatesRefetch: false,
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
      setModalOpen(modal: "auth" | "share" | "slates" | null) {
        set({ modalOpen: modal });
      },
      closeModal() {
        set({ modalOpen: null });
      },
      setSidebarActivationWidth(width: number) {
        set({ sidebarActivationWidth: width });
      },
      setLatestUpdatedSlateId(slateId: string | null) {
        set({ latestUpdatedSlateId: slateId });
      },
      toggleTriggerSlatesRefetch() {
        set((state) => ({ triggerSlatesRefetch: !state.triggerSlatesRefetch }));
      },
    })
  )
);
