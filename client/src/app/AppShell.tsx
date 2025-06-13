"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  NoteIcon,
  ShareIcon,
  PlusIcon,
  UserIcon,
  PaintBrushIcon,
  DotsThreeIcon,
  PenIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useTime } from "framer-motion";
import AuthModal from "../components/modals/AuthModal";
import customAxios from "@/config/axios";
import { useRouter } from "next/navigation";
import errorHandler from "@/utils/errorHandler";

interface MenuPosition {
  id: string;

  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface MenuPositionContextType {
  menuPosition: MenuPosition | null;
  setMenuPosition: (position: MenuPosition | null) => void;
}

const MenuPositionContext = createContext<MenuPositionContextType | null>(null);

function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [slates, setSlates] = useState<Array<SlateMinimal>>([]);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const iconSize = 22;

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" ? true : false
  );

  const router = useRouter();

  const createNewSlate = async () => {
    try {
      const res = await customAxios.post("/slate/new");
      const { data: slate } = res;

      setSlates((prev) => [slate, ...prev]);
      router.push(`/slate/${slate.id}`);
    } catch (e) {
      errorHandler(e);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.getElementById("rootHtml")?.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.getElementById("rootHtml")?.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchSlates = async () => {
      try {
        const res = await customAxios.get("/slate/all");
        const { data: slates } = res;

        setSlates(slates);
      } catch (e) {
        errorHandler(e);
      }
    };
    fetchSlates();
  }, []);

  return (
    <div className="flex flex-row min-h-screen w-full no-scrollbar justify-between">
      <MenuPositionContext.Provider value={{ menuPosition, setMenuPosition }}>
        <MenuWrapper leftSide={true}>
          <div className="flex flex-col h-full justify-between pt-16">
            <div className="flex flex-col flex-grow min-h-0">
              <div
                className={`flex flex-col gap-2 text-sm no-scrollbar ${
                  menuPosition ? "overflow-hidden" : "overflow-scroll"
                }`}
              >
                {slates.map((slate, index) => {
                  return (
                    <ListEntry
                      id={slate.id}
                      key={slate.id}
                      icon={<NoteIcon size={iconSize} />}
                      text={slate.name}
                      delay={index * 0.05}
                      onClick={() => router.push(`/slate/${slate.id}`)}
                      enableMenuButton={true}
                    />
                  );
                })}
              </div>
              <div className="flex flex-col flex-grow mt-3 mb-3">
                <button
                  className="flex flex-row justify-center mx-2 px-[6px] py-[6px] border-dashed border-2 border-silver rounded-lg hover:bg-silver"
                  onClick={createNewSlate}
                >
                  <PlusIcon size={iconSize} className="text-smoke" />
                </button>
              </div>
            </div>
            <div className="flex flex-col text-sm mb-20">
              <ListEntry
                id="user"
                icon={<UserIcon size={iconSize - 2} />}
                text="Sign in"
                onClick={() => setAuthModalOpen(true)}
                className="flex flex-row justify-center items-center"
                textClassName=""
              />
            </div>
          </div>
        </MenuWrapper>
      </MenuPositionContext.Provider>
      <div className="flex-grow">{children}</div>
      <MenuPositionContext.Provider value={{ menuPosition, setMenuPosition }}>
        <MenuWrapper leftSide={false}>
          <div className="flex flex-col h-full justify-between pt-16 text-sm">
            <div className="flex flex-col gap-1">
              <ListEntry
                id="settings"
                icon={<ShareIcon size={iconSize} />}
                text="Share"
                onClick={createNewSlate}
                textClassName="mt-[2px]"
              />
              <ListEntry
                id="theme"
                icon={<PaintBrushIcon size={iconSize} />}
                text={darkMode ? "Light Mode" : "Dark Mode"}
                onClick={() => setDarkMode(!darkMode)}
              />
            </div>
          </div>
        </MenuWrapper>
      </MenuPositionContext.Provider>

      <AuthModal isOpen={authModalOpen} close={() => setAuthModalOpen(false)} />
    </div>
  );
}

const MenuWrapper = ({
  children,
  leftSide,
}: {
  children: React.ReactNode;
  leftSide: boolean;
}) => {
  const context = useContext(MenuPositionContext);
  const { menuPosition, setMenuPosition } = context || {};

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        // setIsHovering(false);
        setSidebarOpen(false);

        if (menuPosition) return setMenuPosition && setMenuPosition(null);
      }}
    >
      {menuPosition && (
        <div className="absolute w-full h-full top-0 left-0 bg-red-500 z-90" />
      )}
      <motion.div
        animate={{ width: sidebarOpen ? "12rem" : "0" }}
        initial={{ width: sidebarOpen ? "12rem" : "0" }}
        className={`z-50 bg-mist border-ash h-screen relative  ${
          sidebarOpen
            ? leftSide
              ? "border-none"
              : "border-none"
            : "border-none"
        }`}
      >
        {children}
      </motion.div>
      <AnimatePresence
        onExitComplete={() => {
          !isHovering && setSidebarOpen(false);
        }}
      >
        {menuPosition && (
          <motion.div
            initial={{ width: "0" }}
            exit={{ width: "0", transition: { duration: 0.2 } }}
            animate={{
              width: menuPosition ? "8rem" : "0",
            }}
            transition={{ duration: 0.2 }}
            className={`absolute flex flex-col z-50 left-full overflow-x-hidden`}
            style={{
              top: menuPosition.top,
            }}
          >
            <div
              className="flex flex-row bg-mist px-2 py-1 rounded-tr-sm hover:bg-silver cursor-pointer"
              onClick={() => {}}
            >
              <div>
                <PenIcon size={20} />
              </div>
              <span className="ml-2">Rename</span>
            </div>
            <div
              className="flex flex-row bg-mist px-2 py-1 rounded-br-sm hover:bg-silver cursor-pointer text-roseRed"
              onClick={() => {}}
            >
              <div>
                <TrashSimpleIcon size={20} />
              </div>
              <span className="ml-2">Delete</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`absolute w-20 top-0 h-screen z-10 bg-red-500 ${
          leftSide ? "left-0" : "right-0"
        } ${sidebarOpen ? "w-0" : "w-12"}`}
        onMouseEnter={() => {
          setSidebarOpen(true);
        }}
      />
    </div>
  );
};

const ListEntry = ({
  id,
  icon,
  text,
  delay = 0,
  rightSide = false,
  className = "",
  textClassName = "",
  enableMenuButton = false,

  onClick = () => {},
}: {
  id: string;
  icon: React.ReactNode;
  text: string;
  delay?: number;
  rightSide?: boolean;
  className?: string;
  textClassName?: string;
  enableMenuButton?: boolean;

  onClick?: () => void;
}) => {
  const context = useContext(MenuPositionContext);
  if (!context) {
    throw new Error(
      "useMenuContext must be used within a MenuContext.Provider"
    );
  }
  const { menuPosition, setMenuPosition } = context;

  const listEntryButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex flex-col overflow-hidden">
        <button
          // animate={
          //   rightSide
          //     ? { opacity: 1, left: "0", bottom: "0" }
          //     : { opacity: 1, right: "0", bottom: "0" }
          // }
          // exit={{ opacity: 0, transition: { duration: 0.2 } }}
          // transition={{
          //   duration: 0.2,
          //   delay: delay,
          //   opacity: { duration: 0.2, ease: [0.9, 0, 1, 1] },
          // }}
          onClick={onClick}
          className={`flex flex-row text-start mx-2 px-[6px] py-[6px] rounded-md justify-between group ${
            menuPosition?.id == id
              ? "bg-silver hover:cursor-default"
              : menuPosition
              ? "hover:cursor-default"
              : "hover:bg-silver"
          } ${className}`}
          ref={listEntryButtonRef}
        >
          <div className="flex flex-row gap-2">
            <div className="min-w-fit">{icon}</div>
            <span className={`truncate ${textClassName}`}>{text}</span>
          </div>
          <div
            className={`px-[4px] rounded-md text-smoke ${
              enableMenuButton && menuPosition?.id == id
                ? "opacity-100 bg-ash hover:cursor-pointer"
                : menuPosition
                ? "opacity-0 hover:cursor-default pointer-events-none"
                : "group-hover:opacity-100 hover:bg-ash hover:cursor-cursor"
            } opacity-0`}
          >
            <div
              className=""
              onClick={(e) => {
                e.stopPropagation();
                if (menuPosition?.id == id) return setMenuPosition(null);

                const rect =
                  listEntryButtonRef.current?.getBoundingClientRect();

                setMenuPosition({
                  top: rect?.top || 0,
                  left: rect?.left || 0,
                  right: rect?.right || 0,
                  bottom: rect?.bottom || 0,
                  width: rect?.width || 0,
                  height: rect?.height || 0,
                  id: id,
                });
              }}
            >
              <DotsThreeIcon size={20} />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AppShell;
