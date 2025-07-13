import { useGlobalStore } from "@/utils/zustand/globalStore";
import { useEffect } from "react";

export const useDynamicSidebarWidth = (customRatio = 2.5) => {
  const setSidebarActivationWidth = useGlobalStore(
    (state) => state.setSidebarActivationWidth
  );

  const calculateActivationWidth = (
    windowWidth: number,
    ratio: number
  ): number => {
    const maxMdBreakpoint = 480;
    const largeScreenWidth = 1536;

    if (windowWidth <= maxMdBreakpoint) return 0;

    const workingRange = largeScreenWidth - maxMdBreakpoint;
    const currentPosition = windowWidth - maxMdBreakpoint;
    const normalizedPosition = Math.min(currentPosition / workingRange, 1);

    const minWidth = windowWidth * 0.1;
    const maxWidth = 224;

    const exponentialFactor = Math.pow(normalizedPosition, 1 / ratio);
    const calculatedWidth =
      minWidth + (maxWidth - minWidth) * exponentialFactor;

    return Math.min(Math.max(calculatedWidth, minWidth), maxWidth);
  };

  useEffect(() => {
    const updateWidth = () => {
      const newWidth = calculateActivationWidth(window.innerWidth, customRatio);
      setSidebarActivationWidth(Math.round(newWidth));
    };

    updateWidth();

    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, [customRatio, setSidebarActivationWidth]);
};
